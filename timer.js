class Timer {

    constructor() {
        this.configuration = {
            singleValueVariant: true,
            // minutesConfigured: null,
            // secondsConfigured: 3,
            minutesConfigured: 35,
            secondsConfigured: null
        };

        this.reset();
    }

    reset() {
        this.state = {
            running: false,
            finished: false,
            milliSecondsElapsed: 0,
            milliSecondsPaused: 0,
            totalSecondsLeft: 0,
            minutesLeft: this.configuration.minutesConfigured, //0,
            secondsLeft: this.configuration.secondsConfigured, //0,
            startTime: null,
            pausedTime: null,
            lastCheckTime: null,
            now: new Date()
        };
    }

    isStartable() {
        return !this.state.running && (this.configuration.minutesConfigured > 0 || this.configuration.secondsConfigured > 0);
    }

    start() {
        console.log('Starting timer');
        if (this.state.startTime === null || this.state.finished) {
            this.state.startTime = new Date();
            this.state.lastCheckTime = this.state.startTime;
            this.state.milliSecondsElapsed = 0;
            this.state.minutesLeft = Number.parseInt(this.configuration.minutesConfigured) || 0;
            this.state.secondsLeft = Number.parseInt(this.configuration.secondsConfigured) || 0;
            this.state.totalSecondsLeft = this.state.minutesLeft * 60 + this.state.secondsLeft;
        }

        if (this.state.pausedTime) {
            this.state.milliSecondsPaused += new Date() - this.state.pausedTime;
        }

        this.state.running = true;
        this.state.finished = false;
    }

    startEngines() {
        console.log('Preparing timer');
        this._run();
    }

    _run() {
        const now = new Date();
        this.state.now = now;

        if (this.state.running) {

            const lastCheck = this.state.pausedTime ? now : this.state.lastCheckTime;

            const differenceInMilliSeconds = Math.floor(now.valueOf() - lastCheck.valueOf());

            if (differenceInMilliSeconds > 0) {

                const secondsBefore = Math.floor(this.state.milliSecondsElapsed / 1000);
                this.state.milliSecondsElapsed += differenceInMilliSeconds;
                const secondsAfter = Math.floor(this.state.milliSecondsElapsed / 1000);

                if (secondsAfter !== secondsBefore) {
                    this.state.totalSecondsLeft -= (secondsAfter - secondsBefore);
                    if (this.state.totalSecondsLeft <= 0) {
                        this.state.running = false;
                        this.state.finished = true;
                        console.log('Timer expired');


                    } else {
                        const minutesLeft = Math.floor(this.state.totalSecondsLeft / 60);
                        const secondsLeft = this.state.totalSecondsLeft % 60;
                        this.state.minutesLeft = minutesLeft;
                        this.state.secondsLeft = secondsLeft;
                    }
                }
            }

            this.state.lastCheckTime = now;

            if (this.state.pausedTime) {
                this.state.pausedTime = null;
            }
        }

        // else if (this.state.pausedTime) {
        //     this.state.milliSecondsPaused += differenceInMilliSeconds;
        // }

        setTimeout(() => this._run(), 100);
    }

    // stop() {
    //     console.log('Stopping timer');
    //     this.state.running = false;
    // }

    pause() {
        console.log('Pausing timer....');
        this.state.running = false;
        this.state.pausedTime = new Date();
    }

    minutesChanged() {
        if (!this.state.startTime) {
            this.state.minutesLeft = this.configuration.minutesConfigured;
        }
    }

    secondsChanged() {
        if (!this.state.startTime) {
            this.state.secondsLeft = this.configuration.secondsConfigured;
        }
    }

    static zuluTime(date) {
        return date ?
            Timer.pad(date.getUTCHours()) + ':' +
            Timer.pad(date.getUTCMinutes()) + ':' +
            Timer.pad(date.getUTCSeconds()) + 'Z' :
            '';
    }

    static pad(value) {
        const n = Number.parseInt(value);
        if (!Number.isInteger(n)) {
            return '00';
        }
        if (n < 10) {
            return '0' + n;
        }
        return n;
    }
}

const {computed, createApp, onMounted, onUnmounted, onUpdated, ref, version} = Vue;

const app = createApp({

    setup() {
        console.group('Creating and preparing Vue app');

        const currentPage = ref("timer");
        const timer = ref(new Timer());

        onMounted(() => {
            console.log('MOUNTED');
            timer.value.startEngines();
        });

        onUnmounted(() => {
            console.log('UNMOUNTED');
        });

        const currentTimerValue = computed(() => {
            return Timer.pad(timer.value.state.minutesLeft) + ':' + Timer.pad(timer.value.state.secondsLeft);
        });

        const currentTimerValueSingle = computed(() => {
            return timer.value.state.minutesLeft > 0 ?
                {value: timer.value.state.minutesLeft, unit: 'min'} :
                {value: (timer.value.state.secondsLeft || 0), unit: 's'};
        });

        const currentZuluTime = computed(() => {
            return Timer.zuluTime(timer.value.state.now);
        });

        const timerStartTime = computed(() => {
            return Timer.zuluTime(timer.value.state.startTime);
        });

        const pausedTime = computed(() => {
            return timer.value.state.milliSecondsPaused;
        });

        const actualConfiguration = computed(() => {
            return Timer.pad(timer.value.configuration.minutesConfigured) +
                ':' +
                Timer.pad(timer.value.configuration.secondsConfigured);
        });

        const timeElapsed = computed(() => {
            const elapsedSeconds = timer.value.state.milliSecondsElapsed / 1000;
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds - (minutes * 60);

            return elapsedSeconds ? minutes + ':' + Timer.pad(seconds) : "";
        });

        const minutesChanged = () => {
            timer.value.minutesChanged();
        };

        const secondsChanged = () => {
            timer.value.secondsChanged();
        };

        const start = () => {
            timer.value.start();
        };

        // const stop = () => {
        //     timer.value.stop();
        // };

        const pause = () => {
            timer.value.pause();
        };

        const reset = () => {
            timer.value.reset();
        };

        const openSeparately = () => {
            const url = './timer.html';
            window.open(url, 'window', 'toolbar=no, menubar=no, location=no, titlebar=no, resizable=yes, width=235, height=325');
        };

        console.groupEnd();

        return {
            appVersion: "1.0.0",
            vueVersion: version,
            currentYear: new Date().getUTCFullYear(),
            currentPage,
            timer,

            currentTimerValue,
            currentTimerValueSingle,
            currentZuluTime,
            timerStartTime,
            pausedTime,
            actualConfiguration,
            timeElapsed,

            minutesChanged,
            secondsChanged,
            start,
            // stop,
            pause,
            reset,
            openSeparately,
        }
    },
});

app.mount("#timer");
