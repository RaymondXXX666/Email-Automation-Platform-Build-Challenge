type CronState = {
    started: boolean;
    lastTickAt: string | null;
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
    lastErrorMessage: string | null;
  };
  
  const cronState: CronState = {
    started: false,
    lastTickAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastErrorMessage: null,
  };
  
  export function markCronStarted() {
    cronState.started = true;
  }
  
  export function markCronTick() {
    cronState.lastTickAt = new Date().toISOString();
  }
  
  export function markCronSuccess() {
    cronState.lastSuccessAt = new Date().toISOString();
  }
  
  export function markCronError(message: string) {
    cronState.lastErrorAt = new Date().toISOString();
    cronState.lastErrorMessage = message;
  }
  
  export function getCronState() {
    return { ...cronState };
  }