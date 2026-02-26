import * as functions from "firebase-functions/v1"

type WorkerModule = {
  handleProjectRequestCreated: (submissionId: string, data: Record<string, unknown>) => Promise<void>
}

let workerModulePromise: Promise<WorkerModule> | null = null

function getWorker() {
  if (!workerModulePromise) {
    workerModulePromise = import("./projectRequestWorker.js")
  }
  return workerModulePromise
}

export const onProjectRequestCreated = functions
  .region("us-central1")
  .runWith({ timeoutSeconds: 180, memory: "512MB" })
  .firestore.document("project_requests/{submissionId}")
  .onCreate(async (snapshot: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const submissionId = context.params.submissionId as string
    const data = snapshot.data() as Record<string, unknown>

    try {
      const worker = await getWorker()
      await worker.handleProjectRequestCreated(submissionId, data)
    } catch (error) {
      console.error("Lazy worker failed for project request processing", {
        submissionId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  })
