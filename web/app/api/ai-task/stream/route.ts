import { getActiveTask } from "@/lib/ai-task-state";
import { getImportedCount } from "@/lib/ai-content-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // client disconnected
        }
      };

      // Max ~2 hours (7200 iterations × 1s)
      for (let i = 0; i < 7200; i++) {
        const task = getActiveTask();
        const importedCount = getImportedCount();

        send({ task, importedCount, timestamp: Date.now() });

        // Stop stream when no active task or task is done
        if (
          !task ||
          task.status === "completed" ||
          task.status === "error"
        ) {
          // Send one final update then close
          await sleep(1500);
          send({ task, importedCount, timestamp: Date.now(), final: true });
          break;
        }

        await sleep(1000);
      }

      try {
        controller.close();
      } catch {
        // ignore
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
