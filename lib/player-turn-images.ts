import { generateImage } from "ai";
import type { DailyGame } from "./daily-game";
import { trackedGenerateText } from "./ai-usage";
import { writeArtifactObject } from "./artifact-store";
import { getOpenAINarrativeModel } from "./openai-models";
import {
  claimPlayerTurnImageGeneration,
  completePlayerTurnImageGeneration,
  failPlayerTurnImageGeneration,
  type DailyPlayer,
  type PlayerTurnImage,
} from "./player-store";

export const PLAYER_TURN_IMAGE_MODEL = "openai/gpt-image-2";
export const PLAYER_TURN_IMAGE_QUALITY = "low";
export const PLAYER_TURN_IMAGE_SIZE = "1024x1024";

type PlayerTurnForImage = {
  id: string;
  actionText: string;
  responseText: string;
  sceneTitle?: string;
};

export async function generatePlayerTurnImage({
  clerkUserId,
  dailyGame,
  player,
  sourceTurnId,
}: {
  clerkUserId: string;
  dailyGame: DailyGame;
  player: DailyPlayer;
  sourceTurnId: string;
}): Promise<PlayerTurnImage | null> {
  const claimedImage = await claimPlayerTurnImageGeneration({
    clerkUserId,
    dailyGameId: dailyGame.id,
    sourceTurnId,
  });

  if (!claimedImage || claimedImage.status === "ready") {
    return claimedImage;
  }

  const turn = findPlayerTurnForImage(player, sourceTurnId);

  if (!turn) {
    return await failPlayerTurnImageGeneration({
      sourceTurnId,
      errorMessage: "Turn not found for image generation.",
    });
  }

  try {
    const promptModel = getOpenAINarrativeModel();
    const promptResult = await trackedGenerateText({
      model: promptModel,
      operation: "player_turn_image_prompt",
      player,
      system:
        "You write concise visual prompts for square cinematic still images from player-visible interactive fiction turns. Return only the image prompt.",
      prompt: [
        "Create one square image prompt for this Are You In gameplay turn.",
        "Use only player-visible details. Do not reveal hidden lore, future events, UI, text overlays, captions, or logos.",
        "Style: grounded cinematic realism, tense near-future speculative fiction, natural lighting, emotionally specific, no gore.",
        `Player: ${player.name}, ${player.age}, ${player.location}, ${player.occupation}.`,
        `Scene title: ${turn.sceneTitle ?? "Untitled scene"}`,
        `Player action: ${turn.actionText}`,
        `Narrator response: ${turn.responseText}`,
      ].join("\n\n"),
    });
    const prompt = promptResult.text.trim();
    const { image } = await generateImage({
      model: PLAYER_TURN_IMAGE_MODEL,
      prompt,
      size: PLAYER_TURN_IMAGE_SIZE,
      providerOptions: {
        openai: {
          quality: PLAYER_TURN_IMAGE_QUALITY,
        },
      },
    });
    const contentType = image.mediaType || "image/png";
    const extension = extensionFromContentType(contentType);
    const artifact = await writeArtifactObject({
      body: image.uint8Array,
      contentType,
      dailyGameId: dailyGame.id,
      extension,
      type: "player_turn_image",
      version: sourceTurnId,
    });

    return await completePlayerTurnImageGeneration({
      bucket: artifact.bucket,
      contentType,
      imageModel: PLAYER_TURN_IMAGE_MODEL,
      objectKey: artifact.objectKey,
      prompt,
      promptModel,
      sourceTurnId,
    });
  } catch (error) {
    return await failPlayerTurnImageGeneration({
      sourceTurnId,
      errorMessage:
        error instanceof Error ? error.message : "Unable to generate image.",
    });
  }
}

export function findPlayerTurnForImage(
  player: DailyPlayer,
  sourceTurnId: string,
): PlayerTurnForImage | null {
  const allTurns: PlayerTurnForImage[] = [
    ...(player.firstPostChoiceTurns ?? []),
    ...(player.firstConnectedPath?.turns ?? []),
    ...(player.firstConnectedPath?.orbDecisionTurns ?? []),
    ...(player.firstConnectedPath?.connectedAsiTurns ?? []),
  ];

  return allTurns.find((turn) => turn.id === sourceTurnId) ?? null;
}

function extensionFromContentType(contentType: string): string {
  if (contentType.includes("webp")) {
    return "webp";
  }

  if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    return "jpg";
  }

  return "png";
}
