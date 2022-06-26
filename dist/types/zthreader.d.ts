declare module "src/zThread" {
    interface zThreadProps {
        completeFn?: () => void;
        executionFn?: () => boolean;
    }
    export default class zThread {
        protected _callback: () => void;
        protected _iterations: number;
        protected _sleepTimeout: number;
        protected _suspended: boolean;
        protected _paused: boolean;
        constructor(props?: zThreadProps);
        run(): void;
        stop(): void;
        pause(): void;
        unpause(): void;
        execute(allocatedTime: number): boolean;
        sleep(duration: number): void;
        isExecutable(): boolean;
        protected _executeInternal(): boolean;
        protected handleComplete(): void;
    }
}
declare module "src/zThreader" {
    import type zThread from "src/zThread";
    export default class zThreader {
        private static _threads;
        private static _fps;
        private static _executeInterval;
        private static _lastExecution;
        private static _priority;
        private static _requestId;
        static init(priority: number, desiredFrameRate: number): void;
        static add(thread: zThread): boolean;
        static remove(thread: zThread): boolean;
        static has(thread: zThread): boolean;
        static stop(): void;
        static getAmountOfThreads(): number;
        static setPriority(percentage: number): void;
        private static run;
        private static execute;
    }
}
declare module "zthreader" {
    import zThreader from "src/zThreader";
    import zThread from "src/zThread";
    export { zThread, zThreader };
}
//# sourceMappingURL=zthreader.d.ts.map