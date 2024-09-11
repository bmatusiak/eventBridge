module.exports = (function () {

    function EventEmitter() {
        this._ = {};
    }

    EventEmitter.prototype._on = function (ev, fn) {
        var l = this._[ev] = this._[ev] || [];
        l.push(fn);
        return this;
    };
    EventEmitter.prototype._once = function (ev, fn) {
        fn.once = true;
        this._on(ev, fn);
    };

    EventEmitter.prototype._emit = function (ev) {

        var self = this
            , args = []
            , event = null
            , l = null
            ;

        if (typeof ev === "object") {
            event = ev.event;
            args = ev.args;
        } else {
            event = ev;
            args = Array.prototype.slice.call(arguments, 1);
        }

        l = this._[event];
        if (!l || !l.length) { return; }

        l.forEach(function (fn, i) {
            fn.apply(self, args);
            if (fn.once) {
                l.splice(i, 1);
            }
        });

        return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype._on;
    EventEmitter.prototype.once = EventEmitter.prototype._once;
    EventEmitter.prototype.emit = EventEmitter.prototype._emit;

    function EventBridge(pubsub) {

        var self = this;

        if (!(this instanceof EventBridge)) {
            return new EventBridge(pubsub);
        }

        EventEmitter.call(self);


        if (pubsub) {
            self.emit = EventBridge.Emitter.call(pubsub);
            pubsub.onmessage = EventBridge.Receiver.call(self);
            return self;
        }

        self.emit = EventBridge.Emitter.call(self);
        self.onmessage = EventBridge.Receiver.call(self);
        return self;
    }

    EventBridge.prototype = Object.create(EventEmitter.prototype);

    EventBridge.Receiver = function () {
        var self = this;
        return function (ev) {
            var e = ev.data || ev;
            if (e.event) {
                // console.warn("Receiver", e)
                self._emit(e);
            }
        };
    };

    EventBridge.Emitter = function () {
        var self = this;
        return function () {
            var ev = new EventBridge.Message(arguments);
            // console.warn("Emitter", ev.data || ev)
            self.postMessage(ev);
        };
    };

    EventBridge.Message = function (args) {
        args = Array.prototype.slice.call(args);
        //this._ = args[0];
        this.event = args[0];
        this.args = args.slice(1);
    };

    EventBridge.prototype = Object.create(EventEmitter.prototype);
    EventBridge.prototype.constructor = EventBridge;

    return EventBridge;
})();
