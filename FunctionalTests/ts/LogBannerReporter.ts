export class LogBannerReporter implements jasmine.CustomReporter {
    private lastTestStarted?: Date;

    public jasmineStarted(): void {
        console.log("*** JASMINE SUITE STARTED ***");
    }

    public jasmineDone(): void {
        console.log("*** JASMINE SUITE FINISHED ***");
    }

    public specStarted(result: jasmine.CustomReporterResult): void {
        const timestamp = new Date();
        this.lastTestStarted = timestamp;
        console.log(`*** SPEC STARTED: ${result.fullName} [${timestamp.toISOString()}] ***`);
    }

    public specDone(result: jasmine.CustomReporterResult): void {
        const timestamp = new Date();

        const duration = this.lastTestStarted ? `${timestamp.getTime() - this.lastTestStarted.getTime()}ms` : "<<unknown>>";
        console.log(`*** SPEC DONE: ${result.fullName} [${timestamp.toISOString()}; Duration: ${duration}] ***`);
    }
}

if (typeof window !== "undefined" && (window as any).customReporterRegistered !== true) {
    (window as any).customReporterRegistered = true;
    jasmine.getEnv().addReporter(new LogBannerReporter());
} else if (typeof window === "undefined") {
    jasmine.getEnv().addReporter(new LogBannerReporter());
}
