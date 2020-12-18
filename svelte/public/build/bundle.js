
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/GameMenu.svelte generated by Svelte v3.24.1 */
    const file = "src/GameMenu.svelte";

    function create_fragment(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let input;
    	let t4;
    	let p1;
    	let t6;
    	let button0;
    	let t7;
    	let t8;
    	let button1;
    	let t9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Welcome!";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Type in your username:";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "First, specify your role";
    			t6 = space();
    			button0 = element("button");
    			t7 = text("Player");
    			t8 = space();
    			button1 = element("button");
    			t9 = text("Voter");
    			add_location(h2, file, 1, 4, 10);
    			add_location(p0, file, 2, 4, 32);
    			attr_dev(input, "type", "text");
    			add_location(input, file, 3, 4, 66);
    			add_location(p1, file, 4, 4, 160);
    			button0.disabled = /*p_disabled*/ ctx[0];
    			add_location(button0, file, 5, 4, 196);
    			button1.disabled = /*v_disabled*/ ctx[1];
    			add_location(button1, file, 6, 4, 290);
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, input);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(div, t6);
    			append_dev(div, button0);
    			append_dev(button0, t7);
    			append_dev(div, t8);
    			append_dev(div, button1);
    			append_dev(button1, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler*/ ctx[3], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*p_disabled*/ 1) {
    				prop_dev(button0, "disabled", /*p_disabled*/ ctx[0]);
    			}

    			if (dirty & /*v_disabled*/ 2) {
    				prop_dev(button1, "disabled", /*v_disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { p_disabled } = $$props;
    	let { v_disabled } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ["p_disabled", "v_disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GameMenu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GameMenu", $$slots, []);
    	const input_handler = event => dispatch("name_change", event.target.value);
    	const click_handler = () => dispatch("join_players");
    	const click_handler_1 = () => dispatch("join_voters");

    	$$self.$$set = $$props => {
    		if ("p_disabled" in $$props) $$invalidate(0, p_disabled = $$props.p_disabled);
    		if ("v_disabled" in $$props) $$invalidate(1, v_disabled = $$props.v_disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		p_disabled,
    		v_disabled,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("p_disabled" in $$props) $$invalidate(0, p_disabled = $$props.p_disabled);
    		if ("v_disabled" in $$props) $$invalidate(1, v_disabled = $$props.v_disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		p_disabled,
    		v_disabled,
    		dispatch,
    		input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class GameMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { p_disabled: 0, v_disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameMenu",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*p_disabled*/ ctx[0] === undefined && !("p_disabled" in props)) {
    			console.warn("<GameMenu> was created without expected prop 'p_disabled'");
    		}

    		if (/*v_disabled*/ ctx[1] === undefined && !("v_disabled" in props)) {
    			console.warn("<GameMenu> was created without expected prop 'v_disabled'");
    		}
    	}

    	get p_disabled() {
    		throw new Error("<GameMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set p_disabled(value) {
    		throw new Error("<GameMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v_disabled() {
    		throw new Error("<GameMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v_disabled(value) {
    		throw new Error("<GameMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var dist = createCommonjsModule(function (module, exports) {
    var __spreadArrays = (commonjsGlobal && commonjsGlobal.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AllowedEvents = void 0;
    var AllowedEvents;
    (function (AllowedEvents) {
        AllowedEvents["redraw"] = "redraw";
        AllowedEvents["fill"] = "fill";
        AllowedEvents["mouseup"] = "mouseup";
        AllowedEvents["mousedown"] = "mousedown";
        AllowedEvents["mouseenter"] = "mouseenter";
        AllowedEvents["mouseleave"] = "mouseleave";
    })(AllowedEvents = exports.AllowedEvents || (exports.AllowedEvents = {}));
    var CanvasFreeDrawing = /** @class */ (function () {
        function CanvasFreeDrawing(params) {
            var elementId = params.elementId, width = params.width, height = params.height, _a = params.backgroundColor, backgroundColor = _a === void 0 ? [255, 255, 255] : _a, _b = params.lineWidth, lineWidth = _b === void 0 ? 5 : _b, _c = params.strokeColor, strokeColor = _c === void 0 ? [0, 0, 0] : _c, disabled = params.disabled, _d = params.showWarnings, showWarnings = _d === void 0 ? false : _d, _e = params.maxSnapshots, maxSnapshots = _e === void 0 ? 10 : _e;
            this.requiredParam(params, 'elementId');
            this.requiredParam(params, 'width');
            this.requiredParam(params, 'height');
            this.elementId = elementId;
            this.canvasNode = document.getElementById(this.elementId);
            if (this.canvasNode instanceof HTMLCanvasElement) {
                this.canvas = this.canvasNode;
            }
            else if (this.canvasNode instanceof HTMLElement) {
                var newCanvas = document.createElement('canvas');
                this.canvasNode.appendChild(newCanvas);
                this.canvas = newCanvas;
            }
            else {
                throw new Error("No element found with following id: " + this.elementId);
            }
            this.context = this.canvas.getContext('2d');
            this.width = width;
            this.height = height;
            this.maxSnapshots = maxSnapshots;
            this.snapshots = [];
            this.undos = [];
            this.positions = [];
            this.leftCanvasDrawing = false; // to check if user left the canvas drawing, on mouseover resume drawing
            this.isDrawing = false;
            this.isDrawingModeEnabled = true;
            this.imageRestored = false;
            this.lineWidth = lineWidth;
            this.strokeColor = this.toValidColor(strokeColor);
            this.bucketToolColor = this.toValidColor(strokeColor);
            this.bucketToolTolerance = 0;
            this.isBucketToolEnabled = false;
            this.listenersList = [
                'mouseDown',
                'mouseMove',
                'mouseLeave',
                'mouseUp',
                'touchStart',
                'touchMove',
                'touchEnd',
            ];
            this.allowedEvents = this.getAllowedEvents();
            this.redrawCounter = 0;
            this.dispatchEventsOnceEvery = 0; // this may become something like: [{event, counter}]
            // initialize events
            this.events = {
                redrawEvent: new Event('cfd_redraw'),
                fillEvent: new Event('cfd_fill'),
                mouseUpEvent: new Event('cfd_mouseup'),
                mouseDownEvent: new Event('cfd_mousedown'),
                mouseEnterEvent: new Event('cfd_mouseenter'),
                mouseLeaveEvent: new Event('cfd_mouseleave'),
                touchStartEvent: new Event('cfd_touchstart'),
                touchEndEvent: new Event('cfd_touchend'),
            };
            this.bindings = {
                mouseDown: this.mouseDown.bind(this),
                mouseMove: this.mouseMove.bind(this),
                mouseLeave: this.mouseLeave.bind(this),
                mouseUp: this.mouseUp.bind(this),
                mouseUpDocument: this.mouseUpDocument.bind(this),
                touchStart: this.touchStart.bind(this),
                touchMove: this.touchMove.bind(this),
                touchEnd: this.touchEnd.bind(this),
            };
            this.touchIdentifier = undefined;
            this.previousX = undefined;
            this.previousY = undefined;
            this.showWarnings = showWarnings;
            // cache
            this.isNodeColorEqualCache = {};
            this.setDimensions();
            this.setBackground(backgroundColor);
            this.storeSnapshot();
            if (!disabled)
                this.enableDrawingMode();
        }
        CanvasFreeDrawing.prototype.requiredParam = function (object, param) {
            if (!object || !object[param]) {
                throw new Error(param + " is required");
            }
        };
        CanvasFreeDrawing.prototype.logWarning = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.showWarnings)
                console.warn.apply(console, args);
        };
        CanvasFreeDrawing.prototype.addListeners = function () {
            var _this = this;
            this.listenersList.forEach(function (event) {
                _this.canvas.addEventListener(event.toLowerCase(), _this.bindings[event]);
            });
            document.addEventListener('mouseup', this.bindings.mouseUpDocument);
        };
        CanvasFreeDrawing.prototype.removeListeners = function () {
            var _this = this;
            this.listenersList.forEach(function (event) {
                _this.canvas.removeEventListener(event.toLowerCase(), _this.bindings[event]);
            });
            document.removeEventListener('mouseup', this.bindings.mouseUpDocument);
        };
        CanvasFreeDrawing.prototype.getAllowedEvents = function () {
            var events = [];
            for (var event_1 in AllowedEvents) {
                events.push(event_1);
            }
            return events;
        };
        CanvasFreeDrawing.prototype.enableDrawingMode = function () {
            this.isDrawingModeEnabled = true;
            this.addListeners();
            this.toggleCursor();
            return this.isDrawingModeEnabled;
        };
        CanvasFreeDrawing.prototype.disableDrawingMode = function () {
            this.isDrawingModeEnabled = false;
            this.removeListeners();
            this.toggleCursor();
            return this.isDrawingModeEnabled;
        };
        CanvasFreeDrawing.prototype.mouseDown = function (event) {
            if (event.button !== 0)
                return;
            this.drawPoint(event.offsetX, event.offsetY);
        };
        CanvasFreeDrawing.prototype.mouseMove = function (event) {
            this.drawLine(event.offsetX, event.offsetY, event);
        };
        CanvasFreeDrawing.prototype.touchStart = function (event) {
            if (event.changedTouches.length > 0) {
                var _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY, identifier = _a.identifier;
                var x = pageX - this.canvas.offsetLeft;
                var y = pageY - this.canvas.offsetTop;
                this.touchIdentifier = identifier;
                this.drawPoint(x, y);
            }
        };
        CanvasFreeDrawing.prototype.touchMove = function (event) {
            if (event.changedTouches.length > 0) {
                var _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY, identifier = _a.identifier;
                var x = pageX - this.canvas.offsetLeft;
                var y = pageY - this.canvas.offsetTop;
                // check if is multi touch, if it is do nothing
                if (identifier != this.touchIdentifier)
                    return;
                this.previousX = x;
                this.previousY = y;
                this.drawLine(x, y, event);
            }
        };
        CanvasFreeDrawing.prototype.touchEnd = function () {
            this.handleEndDrawing();
            this.canvas.dispatchEvent(this.events.touchEndEvent);
        };
        CanvasFreeDrawing.prototype.mouseUp = function () {
            this.handleEndDrawing();
            this.canvas.dispatchEvent(this.events.mouseUpEvent);
        };
        CanvasFreeDrawing.prototype.mouseUpDocument = function () {
            this.leftCanvasDrawing = false;
        };
        CanvasFreeDrawing.prototype.mouseLeave = function () {
            if (this.isDrawing)
                this.leftCanvasDrawing = true;
            this.isDrawing = false;
            this.canvas.dispatchEvent(this.events.mouseLeaveEvent);
        };
        CanvasFreeDrawing.prototype.mouseEnter = function () {
            this.canvas.dispatchEvent(this.events.mouseEnterEvent);
        };
        CanvasFreeDrawing.prototype.handleEndDrawing = function () {
            this.isDrawing = false;
            this.storeSnapshot();
        };
        CanvasFreeDrawing.prototype.drawPoint = function (x, y) {
            if (this.isBucketToolEnabled) {
                this.fill(x, y, this.bucketToolColor, {
                    tolerance: this.bucketToolTolerance,
                });
            }
            else {
                this.isDrawing = true;
                this.storeDrawing(x, y, false);
                this.canvas.dispatchEvent(this.events.mouseDownEvent);
                this.handleDrawing();
            }
        };
        CanvasFreeDrawing.prototype.drawLine = function (x, y, event) {
            if (this.leftCanvasDrawing) {
                this.leftCanvasDrawing = false;
                if (event instanceof MouseEvent) {
                    this.mouseDown(event);
                }
                else if (event instanceof TouchEvent) {
                    this.touchEnd();
                }
            }
            if (this.isDrawing) {
                this.storeDrawing(x, y, true);
                this.handleDrawing(this.dispatchEventsOnceEvery);
            }
        };
        CanvasFreeDrawing.prototype.handleDrawing = function (dispatchEventsOnceEvery) {
            var _this = this;
            this.context.lineJoin = 'round';
            var positions = [__spreadArrays(this.positions).pop()];
            positions.forEach(function (position) {
                if (position && position[0] && position[0].strokeColor) {
                    _this.context.strokeStyle = _this.rgbaFromArray(position[0].strokeColor);
                    _this.context.lineWidth = position[0].lineWidth;
                    _this.draw(position);
                }
            });
            if (!dispatchEventsOnceEvery) {
                this.canvas.dispatchEvent(this.events.redrawEvent);
            }
            else if (this.redrawCounter % dispatchEventsOnceEvery === 0) {
                this.canvas.dispatchEvent(this.events.redrawEvent);
            }
            this.undos = [];
            this.redrawCounter += 1;
        };
        CanvasFreeDrawing.prototype.draw = function (position) {
            var _this = this;
            position.forEach(function (_a, i) {
                var x = _a.x, y = _a.y, moving = _a.moving;
                _this.context.beginPath();
                if (moving && i) {
                    _this.context.moveTo(position[i - 1]['x'], position[i - 1]['y']);
                }
                else {
                    _this.context.moveTo(x - 1, y);
                }
                _this.context.lineTo(x, y);
                _this.context.closePath();
                _this.context.stroke();
            });
        };
        // https://en.wikipedia.org/wiki/Flood_fill
        CanvasFreeDrawing.prototype.fill = function (x, y, newColor, _a) {
            var tolerance = _a.tolerance;
            newColor = this.toValidColor(newColor);
            if (this.positions.length === 0 && !this.imageRestored) {
                this.setBackground(newColor, false);
                this.canvas.dispatchEvent(this.events.redrawEvent);
                this.canvas.dispatchEvent(this.events.fillEvent);
                return;
            }
            var pixels = this.width * this.height;
            var imageData = this.context.getImageData(0, 0, this.width, this.height);
            var newData = imageData.data;
            var targetColor = this.getNodeColor(x, y, newData);
            if (this.isNodeColorEqual(targetColor, newColor, tolerance))
                return;
            var queue = [];
            queue.push([x, y]);
            while (queue.length) {
                if (queue.length > pixels)
                    break;
                var n = queue.pop();
                var w = n;
                var e = n;
                while (this.isNodeColorEqual(this.getNodeColor(w[0] - 1, w[1], newData), targetColor, tolerance)) {
                    w = [w[0] - 1, w[1]];
                }
                while (this.isNodeColorEqual(this.getNodeColor(e[0] + 1, e[1], newData), targetColor, tolerance)) {
                    e = [e[0] + 1, e[1]];
                }
                var firstNode = w[0];
                var lastNode = e[0];
                for (var i = firstNode; i <= lastNode; i++) {
                    this.setNodeColor(i, w[1], newColor, newData);
                    if (this.isNodeColorEqual(this.getNodeColor(i, w[1] + 1, newData), targetColor, tolerance)) {
                        queue.push([i, w[1] + 1]);
                    }
                    if (this.isNodeColorEqual(this.getNodeColor(i, w[1] - 1, newData), targetColor, tolerance)) {
                        queue.push([i, w[1] - 1]);
                    }
                }
            }
            this.context.putImageData(imageData, 0, 0);
            this.canvas.dispatchEvent(this.events.redrawEvent);
            this.canvas.dispatchEvent(this.events.fillEvent);
        };
        CanvasFreeDrawing.prototype.toValidColor = function (color) {
            if (Array.isArray(color) && color.length === 4)
                return color;
            if (Array.isArray(color) && color.length === 3) {
                var validColor = __spreadArrays(color);
                validColor.push(255);
                return validColor;
            }
            else {
                this.logWarning('Color is not valid!\n' +
                    'It must be an array with RGB values:  [0-255, 0-255, 0-255]');
                return [0, 0, 0, 255];
            }
        };
        // i = color 1; j = color 2; t = tolerance
        CanvasFreeDrawing.prototype.isNodeColorEqual = function (i, j, t) {
            var color1 = '' + i[0] + i[1] + i[2] + i[3];
            var color2 = '' + j[0] + j[1] + j[2] + j[3];
            var key = color1 + color2 + t;
            t = t || 0;
            if (this.isNodeColorEqualCache.hasOwnProperty(color1 + color2 + t)) {
                return this.isNodeColorEqualCache[key];
            }
            var diffRed = Math.abs(j[0] - i[0]);
            var diffGreen = Math.abs(j[1] - i[1]);
            var diffBlue = Math.abs(j[2] - i[2]);
            var percentDiffRed = diffRed / 255;
            var percentDiffGreen = diffGreen / 255;
            var percentDiffBlue = diffBlue / 255;
            var percentDiff = ((percentDiffRed + percentDiffGreen + percentDiffBlue) / 3) * 100;
            var result = t >= percentDiff;
            this.isNodeColorEqualCache[key] = result;
            return result;
        };
        CanvasFreeDrawing.prototype.getNodeColor = function (x, y, data) {
            var i = (x + y * this.width) * 4;
            return [data[i], data[i + 1], data[i + 2], data[i + 3]];
        };
        CanvasFreeDrawing.prototype.setNodeColor = function (x, y, color, data) {
            var i = (x + y * this.width) * 4;
            data[i] = color[0];
            data[i + 1] = color[1];
            data[i + 2] = color[2];
            data[i + 3] = color[3];
        };
        CanvasFreeDrawing.prototype.rgbaFromArray = function (a) {
            return "rgba(" + a[0] + "," + a[1] + "," + a[2] + "," + a[3] + ")";
        };
        CanvasFreeDrawing.prototype.setDimensions = function () {
            this.canvas.height = this.height;
            this.canvas.width = this.width;
        };
        CanvasFreeDrawing.prototype.toggleCursor = function () {
            this.canvas.style.cursor = this.isDrawingModeEnabled ? 'crosshair' : 'auto';
        };
        CanvasFreeDrawing.prototype.storeDrawing = function (x, y, moving) {
            if (moving) {
                var lastIndex = this.positions.length - 1;
                this.positions[lastIndex].push({
                    x: x,
                    y: y,
                    moving: moving,
                    lineWidth: this.lineWidth,
                    strokeColor: this.strokeColor,
                    isBucket: false,
                });
            }
            else {
                this.positions.push([
                    {
                        x: x,
                        y: y,
                        isBucket: false,
                        moving: moving,
                        lineWidth: this.lineWidth,
                        strokeColor: this.strokeColor,
                    },
                ]);
            }
        };
        CanvasFreeDrawing.prototype.storeSnapshot = function () {
            var imageData = this.getCanvasSnapshot();
            this.snapshots.push(imageData);
            if (this.snapshots.length > this.maxSnapshots) {
                this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
            }
        };
        CanvasFreeDrawing.prototype.getCanvasSnapshot = function () {
            return this.context.getImageData(0, 0, this.width, this.height);
        };
        CanvasFreeDrawing.prototype.restoreCanvasSnapshot = function (imageData) {
            this.context.putImageData(imageData, 0, 0);
        };
        // Public APIs
        CanvasFreeDrawing.prototype.on = function (params, callback) {
            var event = params.event, counter = params.counter;
            this.requiredParam(params, 'event');
            if (this.allowedEvents.includes(event)) {
                if (event === 'redraw' && counter && Number.isInteger(counter)) {
                    this.dispatchEventsOnceEvery = counter;
                }
                this.canvas.addEventListener('cfd_' + event, function () { return callback(); });
            }
            else {
                this.logWarning("This event is not allowed: " + event);
            }
        };
        CanvasFreeDrawing.prototype.setLineWidth = function (px) {
            this.lineWidth = px;
        };
        CanvasFreeDrawing.prototype.setBackground = function (color, save) {
            if (save === void 0) { save = true; }
            var validColor = this.toValidColor(color);
            if (validColor) {
                if (save)
                    this.backgroundColor = validColor;
                this.context.fillStyle = this.rgbaFromArray(validColor);
                this.context.fillRect(0, 0, this.width, this.height);
            }
        };
        CanvasFreeDrawing.prototype.setDrawingColor = function (color) {
            this.configBucketTool({ color: color });
            this.setStrokeColor(color);
        };
        CanvasFreeDrawing.prototype.setStrokeColor = function (color) {
            this.strokeColor = this.toValidColor(color);
        };
        CanvasFreeDrawing.prototype.configBucketTool = function (params) {
            var _a = params.color, color = _a === void 0 ? null : _a, _b = params.tolerance, tolerance = _b === void 0 ? null : _b;
            if (color)
                this.bucketToolColor = this.toValidColor(color);
            if (tolerance && tolerance > 0) {
                this.bucketToolTolerance = tolerance > 100 ? 100 : tolerance;
            }
        };
        CanvasFreeDrawing.prototype.toggleBucketTool = function () {
            return (this.isBucketToolEnabled = !this.isBucketToolEnabled);
        };
        CanvasFreeDrawing.prototype.toggleDrawingMode = function () {
            return this.isDrawingModeEnabled
                ? this.disableDrawingMode()
                : this.enableDrawingMode();
        };
        CanvasFreeDrawing.prototype.clear = function () {
            this.context.clearRect(0, 0, this.width, this.height);
            this.positions = [];
            this.imageRestored = false;
            if (this.backgroundColor)
                this.setBackground(this.backgroundColor);
            this.handleEndDrawing();
        };
        CanvasFreeDrawing.prototype.save = function () {
            return this.canvas.toDataURL();
        };
        CanvasFreeDrawing.prototype.restore = function (backup, callback) {
            var _this = this;
            var image = new Image();
            image.src = backup;
            image.onload = function () {
                _this.imageRestored = true;
                _this.context.drawImage(image, 0, 0);
                if (typeof callback === 'function')
                    callback();
            };
        };
        CanvasFreeDrawing.prototype.undo = function () {
            var lastSnapshot = this.snapshots[this.snapshots.length - 1];
            var goToSnapshot = this.snapshots[this.snapshots.length - 2];
            if (goToSnapshot) {
                this.restoreCanvasSnapshot(goToSnapshot);
                this.snapshots.pop();
                this.undos.push(lastSnapshot);
                this.undos = this.undos.splice(-Math.abs(this.maxSnapshots));
                this.imageRestored = true;
            }
            else {
                this.logWarning('There are no more undos left.');
            }
        };
        CanvasFreeDrawing.prototype.redo = function () {
            if (this.undos.length > 0) {
                var lastUndo = this.undos.pop();
                if (lastUndo) {
                    this.restoreCanvasSnapshot(lastUndo);
                    this.snapshots.push(lastUndo);
                    this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
                }
            }
            else {
                this.logWarning('There are no more redo left.');
            }
        };
        return CanvasFreeDrawing;
    }());
    exports.default = CanvasFreeDrawing;
    });

    /* src/DrawingBoard.svelte generated by Svelte v3.24.1 */
    const file$1 = "src/DrawingBoard.svelte";

    function create_fragment$1(ctx) {
    	let div6;
    	let h2;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div4;
    	let div0;
    	let canvas;
    	let t4;
    	let div3;
    	let div1;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let button2;
    	let t10;
    	let div2;
    	let button3;
    	let t12;
    	let button4;
    	let t14;
    	let button5;
    	let t16;
    	let button6;
    	let t18;
    	let div5;
    	let button7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			h2 = element("h2");
    			t0 = text("Draw a ");
    			t1 = text(/*subject*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			div4 = element("div");
    			div0 = element("div");
    			canvas = element("canvas");
    			t4 = space();
    			div3 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "undo";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "redo";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "clear";
    			t10 = space();
    			div2 = element("div");
    			button3 = element("button");
    			button3.textContent = "Red";
    			t12 = space();
    			button4 = element("button");
    			button4.textContent = "Green";
    			t14 = space();
    			button5 = element("button");
    			button5.textContent = "Blue";
    			t16 = space();
    			button6 = element("button");
    			button6.textContent = "Black";
    			t18 = space();
    			div5 = element("div");
    			button7 = element("button");
    			button7.textContent = "Next!";
    			add_location(h2, file$1, 14, 2, 161);
    			attr_dev(canvas, "id", "cfd");
    			add_location(canvas, file$1, 17, 6, 233);
    			attr_dev(div0, "class", "left-element svelte-18osde");
    			add_location(div0, file$1, 16, 4, 200);
    			add_location(button0, file$1, 21, 8, 323);
    			add_location(button1, file$1, 22, 8, 385);
    			add_location(button2, file$1, 23, 8, 447);
    			add_location(div1, file$1, 20, 6, 309);
    			set_style(button3, "border", "2px solid #f44336");
    			add_location(button3, file$1, 26, 8, 534);
    			set_style(button4, "border", "2px solid #4CAF50");
    			add_location(button4, file$1, 27, 8, 649);
    			set_style(button5, "border", "2px solid #008CBA");
    			add_location(button5, file$1, 28, 8, 766);
    			set_style(button6, "border", "2px solid #555555");
    			add_location(button6, file$1, 29, 8, 882);
    			add_location(div2, file$1, 25, 6, 520);
    			attr_dev(div3, "class", "right-element svelte-18osde");
    			add_location(div3, file$1, 19, 4, 275);
    			add_location(div4, file$1, 15, 2, 190);
    			add_location(button7, file$1, 34, 4, 1055);
    			attr_dev(div5, "class", "left-element svelte-18osde");
    			add_location(div5, file$1, 33, 2, 1024);
    			add_location(div6, file$1, 13, 0, 153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div4);
    			append_dev(div4, div0);
    			append_dev(div0, canvas);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t6);
    			append_dev(div1, button1);
    			append_dev(div1, t8);
    			append_dev(div1, button2);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, button3);
    			append_dev(div2, t12);
    			append_dev(div2, button4);
    			append_dev(div2, t14);
    			append_dev(div2, button5);
    			append_dev(div2, t16);
    			append_dev(div2, button6);
    			append_dev(div6, t18);
    			append_dev(div6, div5);
    			append_dev(div5, button7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[6], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[7], false, false, false),
    					listen_dev(button5, "click", /*click_handler_5*/ ctx[8], false, false, false),
    					listen_dev(button6, "click", /*click_handler_6*/ ctx[9], false, false, false),
    					listen_dev(button7, "click", /*click_handler_7*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*subject*/ 1) set_data_dev(t1, /*subject*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { subject } = $$props;
    	let cfd = null;
    	const dispatch = createEventDispatcher();
    	onMount(() => setup());

    	function setup() {
    		$$invalidate(1, cfd = new dist.default({
    				elementId: "cfd",
    				width: 500,
    				height: 500
    			}));

    		// set properties
    		cfd.setLineWidth(10); // in px

    		cfd.setStrokeColor([0, 0, 0]); // in RGB
    	}

    	const writable_props = ["subject"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DrawingBoard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DrawingBoard", $$slots, []);
    	const click_handler = () => cfd.undo();
    	const click_handler_1 = () => cfd.redo();
    	const click_handler_2 = () => cfd.clear();
    	const click_handler_3 = () => cfd.setDrawingColor([255, 0, 0]);
    	const click_handler_4 = () => cfd.setDrawingColor([0, 255, 0]);
    	const click_handler_5 = () => cfd.setDrawingColor([0, 0, 255]);
    	const click_handler_6 = () => cfd.setDrawingColor([0, 0, 0]);
    	const click_handler_7 = () => dispatch("next", cfd.save());

    	$$self.$$set = $$props => {
    		if ("subject" in $$props) $$invalidate(0, subject = $$props.subject);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		CanvasFreeDrawing: dist,
    		subject,
    		cfd,
    		dispatch,
    		setup
    	});

    	$$self.$inject_state = $$props => {
    		if ("subject" in $$props) $$invalidate(0, subject = $$props.subject);
    		if ("cfd" in $$props) $$invalidate(1, cfd = $$props.cfd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		subject,
    		cfd,
    		dispatch,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7
    	];
    }

    class DrawingBoard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { subject: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DrawingBoard",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*subject*/ ctx[0] === undefined && !("subject" in props)) {
    			console.warn("<DrawingBoard> was created without expected prop 'subject'");
    		}
    	}

    	get subject() {
    		throw new Error("<DrawingBoard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subject(value) {
    		throw new Error("<DrawingBoard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/VoteDrawings.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1 } = globals;
    const file$2 = "src/VoteDrawings.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i][0];
    	child_ctx[7] = list[i][1];
    	return child_ctx;
    }

    // (3:4) {#if key !== '[object Object]'}
    function create_if_block(ctx) {
    	let h2;
    	let t0;
    	let t1_value = /*key*/ ctx[6] + "";
    	let t1;
    	let t2;
    	let t3;
    	let p;
    	let t5;
    	let table;
    	let tbody;
    	let each_value_1 = /*item*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("Players were prompted to draw a ");
    			t1 = text(t1_value);
    			t2 = text("!");
    			t3 = space();
    			p = element("p");
    			p.textContent = "This is what they did:";
    			t5 = space();
    			table = element("table");
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$2, 3, 6, 102);
    			add_location(p, file$2, 4, 6, 157);
    			add_location(tbody, file$2, 6, 8, 211);
    			add_location(table, file$2, 5, 6, 195);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*game_content*/ 1 && t1_value !== (t1_value = /*key*/ ctx[6] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*disabled, Object, game_content, dispatch*/ 7) {
    				each_value_1 = /*item*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(3:4) {#if key !== '[object Object]'}",
    		ctx
    	});

    	return block;
    }

    // (8:10) {#each item as data}
    function create_each_block_1(ctx) {
    	let tr;
    	let td0;
    	let img;
    	let img_src_value;
    	let t0;
    	let td1;
    	let button;
    	let t1;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*key*/ ctx[6], /*data*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			img = element("img");
    			t0 = space();
    			td1 = element("td");
    			button = element("button");
    			t1 = text("Vote this!");
    			attr_dev(img, "width", "100");
    			if (img.src !== (img_src_value = /*data*/ ctx[10].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 10, 16, 302);
    			add_location(td0, file$2, 9, 14, 281);
    			button.disabled = button_disabled_value = /*disabled*/ ctx[1][/*key*/ ctx[6]];
    			add_location(button, file$2, 13, 16, 390);
    			add_location(td1, file$2, 12, 14, 369);
    			add_location(tr, file$2, 8, 12, 262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, img);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, button);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*game_content*/ 1 && img.src !== (img_src_value = /*data*/ ctx[10].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*disabled, game_content*/ 3 && button_disabled_value !== (button_disabled_value = /*disabled*/ ctx[1][/*key*/ ctx[6]])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(8:10) {#each item as data}",
    		ctx
    	});

    	return block;
    }

    // (2:2) {#each Object.entries(game_content) as [key, item]}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*key*/ ctx[6] !== "[object Object]" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*key*/ ctx[6] !== "[object Object]") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(2:2) {#each Object.entries(game_content) as [key, item]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = Object.entries(/*game_content*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			button.textContent = "Finish!";
    			add_location(button, file$2, 24, 2, 702);
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, game_content, disabled, dispatch*/ 7) {
    				each_value = Object.entries(/*game_content*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { game_content } = $$props;
    	let { votes } = $$props;
    	let { disabled } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ["game_content", "votes", "disabled"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VoteDrawings> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("VoteDrawings", $$slots, []);
    	const click_handler = (key, data) => dispatch("cast_vote", { "subject": key, "player_name": data.from });
    	const click_handler_1 = () => dispatch("finish");

    	$$self.$$set = $$props => {
    		if ("game_content" in $$props) $$invalidate(0, game_content = $$props.game_content);
    		if ("votes" in $$props) $$invalidate(3, votes = $$props.votes);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		game_content,
    		votes,
    		disabled,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("game_content" in $$props) $$invalidate(0, game_content = $$props.game_content);
    		if ("votes" in $$props) $$invalidate(3, votes = $$props.votes);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [game_content, disabled, dispatch, votes, click_handler, click_handler_1];
    }

    class VoteDrawings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { game_content: 0, votes: 3, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VoteDrawings",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*game_content*/ ctx[0] === undefined && !("game_content" in props)) {
    			console.warn("<VoteDrawings> was created without expected prop 'game_content'");
    		}

    		if (/*votes*/ ctx[3] === undefined && !("votes" in props)) {
    			console.warn("<VoteDrawings> was created without expected prop 'votes'");
    		}

    		if (/*disabled*/ ctx[1] === undefined && !("disabled" in props)) {
    			console.warn("<VoteDrawings> was created without expected prop 'disabled'");
    		}
    	}

    	get game_content() {
    		throw new Error("<VoteDrawings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game_content(value) {
    		throw new Error("<VoteDrawings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get votes() {
    		throw new Error("<VoteDrawings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set votes(value) {
    		throw new Error("<VoteDrawings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<VoteDrawings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<VoteDrawings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ResultsDisplayer.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1$1 } = globals;
    const file$3 = "src/ResultsDisplayer.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i][0];
    	child_ctx[8] = list[i][1];
    	return child_ctx;
    }

    // (4:8) {#each Object.entries(podium) as [key, item]}
    function create_each_block$1(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*prefix*/ ctx[2][/*key*/ ctx[7]] + "";
    	let t1;
    	let t2;
    	let t3_value = /*item*/ ctx[8][0] + "";
    	let t3;
    	let t4;
    	let t5_value = /*item*/ ctx[8][1] + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("In the ");
    			t1 = text(t1_value);
    			t2 = text(" place: ");
    			t3 = text(t3_value);
    			t4 = text(", with ");
    			t5 = text(t5_value);
    			t6 = text(" vote(s)!");
    			set_style(p, "font-size", /*font_size*/ ctx[1][/*key*/ ctx[7]]);
    			add_location(p, file$3, 4, 10, 114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*podium*/ 1 && t1_value !== (t1_value = /*prefix*/ ctx[2][/*key*/ ctx[7]] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*podium*/ 1 && t3_value !== (t3_value = /*item*/ ctx[8][0] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*podium*/ 1 && t5_value !== (t5_value = /*item*/ ctx[8][1] + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*podium*/ 1) {
    				set_style(p, "font-size", /*font_size*/ ctx[1][/*key*/ ctx[7]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(4:8) {#each Object.entries(podium) as [key, item]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h3;
    	let t3;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = Object.entries(/*podium*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Results!";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "Podium";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			button = element("button");
    			button.textContent = "Main Menu";
    			add_location(h2, file$3, 1, 4, 10);
    			add_location(h3, file$3, 2, 6, 34);
    			add_location(button, file$3, 8, 6, 266);
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h3);
    			append_dev(div, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t4);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*font_size, Object, podium, prefix*/ 7) {
    				each_value = Object.entries(/*podium*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let podium = {};
    	const font_size = ["200%", "150%", "125%"];
    	const prefix = ["1st", "2nd", "3rd"];
    	let { results } = $$props;
    	const dispatch = createEventDispatcher();
    	onMount(() => setup());

    	function setup() {
    		let local_res = results;

    		let items = Object.keys(local_res).map(function (key) {
    			return [key, local_res[key]];
    		});

    		items.sort(function (first, second) {
    			return second[1] - first[1];
    		});

    		$$invalidate(0, podium = items.slice(0, 3));
    	}

    	const writable_props = ["results"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultsDisplayer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ResultsDisplayer", $$slots, []);
    	const click_handler = () => dispatch("reset_client");

    	$$self.$$set = $$props => {
    		if ("results" in $$props) $$invalidate(4, results = $$props.results);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		podium,
    		font_size,
    		prefix,
    		results,
    		dispatch,
    		setup
    	});

    	$$self.$inject_state = $$props => {
    		if ("podium" in $$props) $$invalidate(0, podium = $$props.podium);
    		if ("results" in $$props) $$invalidate(4, results = $$props.results);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [podium, font_size, prefix, dispatch, results, click_handler];
    }

    class ResultsDisplayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { results: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultsDisplayer",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*results*/ ctx[4] === undefined && !("results" in props)) {
    			console.warn("<ResultsDisplayer> was created without expected prop 'results'");
    		}
    	}

    	get results() {
    		throw new Error("<ResultsDisplayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<ResultsDisplayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/GameState.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/GameState.svelte";

    // (2:2) {#if game_state === 'menu'}
    function create_if_block_4(ctx) {
    	let gamemenu;
    	let current;

    	gamemenu = new GameMenu({
    			props: {
    				p_disabled: /*name*/ ctx[1].length === 0 || !/*connected*/ ctx[2],
    				v_disabled: !/*connected*/ ctx[2]
    			},
    			$$inline: true
    		});

    	gamemenu.$on("join_players", /*on_join_players*/ ctx[11]);
    	gamemenu.$on("join_voters", /*on_join_voters*/ ctx[12]);
    	gamemenu.$on("name_change", /*on_name_change*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(gamemenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamemenu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gamemenu_changes = {};
    			if (dirty & /*name, connected*/ 6) gamemenu_changes.p_disabled = /*name*/ ctx[1].length === 0 || !/*connected*/ ctx[2];
    			if (dirty & /*connected*/ 4) gamemenu_changes.v_disabled = !/*connected*/ ctx[2];
    			gamemenu.$set(gamemenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamemenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamemenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamemenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(2:2) {#if game_state === 'menu'}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#if game_state === 'waiting_screen'}
    function create_if_block_3(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let t2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Please wait...";
    			t1 = space();
    			p = element("p");
    			t2 = text(/*await_reason*/ ctx[6]);
    			add_location(h2, file$4, 10, 8, 343);
    			add_location(p, file$4, 11, 8, 375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*await_reason*/ 64) set_data_dev(t2, /*await_reason*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(10:2) {#if game_state === 'waiting_screen'}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#if game_state === 'drawing'}
    function create_if_block_2(ctx) {
    	let drawingboard;
    	let current;

    	drawingboard = new DrawingBoard({
    			props: {
    				subject: /*subjects*/ ctx[7][/*subject_index*/ ctx[3]]
    			},
    			$$inline: true
    		});

    	drawingboard.$on("next", /*on_next*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(drawingboard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(drawingboard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const drawingboard_changes = {};
    			if (dirty & /*subjects, subject_index*/ 136) drawingboard_changes.subject = /*subjects*/ ctx[7][/*subject_index*/ ctx[3]];
    			drawingboard.$set(drawingboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drawingboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drawingboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(drawingboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(15:2) {#if game_state === 'drawing'}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#if game_state === 'votes'}
    function create_if_block_1(ctx) {
    	let votedrawings;
    	let current;

    	votedrawings = new VoteDrawings({
    			props: {
    				game_content: /*game_content*/ ctx[4],
    				votes: /*votes*/ ctx[5],
    				disabled: /*disabled*/ ctx[8]
    			},
    			$$inline: true
    		});

    	votedrawings.$on("cast_vote", /*cast_vote*/ ctx[14]);
    	votedrawings.$on("finish", /*on_finish*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(votedrawings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(votedrawings, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const votedrawings_changes = {};
    			if (dirty & /*game_content*/ 16) votedrawings_changes.game_content = /*game_content*/ ctx[4];
    			if (dirty & /*votes*/ 32) votedrawings_changes.votes = /*votes*/ ctx[5];
    			if (dirty & /*disabled*/ 256) votedrawings_changes.disabled = /*disabled*/ ctx[8];
    			votedrawings.$set(votedrawings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(votedrawings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(votedrawings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(votedrawings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:2) {#if game_state === 'votes'}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {#if game_state === 'results'}
    function create_if_block$1(ctx) {
    	let resultsdisplayer;
    	let current;

    	resultsdisplayer = new ResultsDisplayer({
    			props: { results: /*results*/ ctx[9] },
    			$$inline: true
    		});

    	resultsdisplayer.$on("reset_client", /*reset_client*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(resultsdisplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultsdisplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultsdisplayer_changes = {};
    			if (dirty & /*results*/ 512) resultsdisplayer_changes.results = /*results*/ ctx[9];
    			resultsdisplayer.$set(resultsdisplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultsdisplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultsdisplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultsdisplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(29:2) {#if game_state === 'results'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	let if_block0 = /*game_state*/ ctx[0] === "menu" && create_if_block_4(ctx);
    	let if_block1 = /*game_state*/ ctx[0] === "waiting_screen" && create_if_block_3(ctx);
    	let if_block2 = /*game_state*/ ctx[0] === "drawing" && create_if_block_2(ctx);
    	let if_block3 = /*game_state*/ ctx[0] === "votes" && create_if_block_1(ctx);
    	let if_block4 = /*game_state*/ ctx[0] === "results" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*game_state*/ ctx[0] === "menu") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*game_state*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*game_state*/ ctx[0] === "waiting_screen") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*game_state*/ ctx[0] === "drawing") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*game_state*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*game_state*/ ctx[0] === "votes") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*game_state*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*game_state*/ ctx[0] === "results") {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*game_state*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$1(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let game_state = "menu";
    	let name = "";
    	let connected = false;
    	let subject_index = 0;
    	let game_content = {};
    	let votes = {};
    	let await_reason = "";
    	let subjects = [];
    	let ws = null;
    	let disabled = {};
    	let cli_hash = Math.random().toString(36).substring(7);
    	let votes_on_player = {};
    	let results = {};
    	onMount(() => connect());

    	function on_next(data) {
    		let img = data.detail;
    		const subject = subjects[subject_index];

    		ws.send(JSON.stringify({
    			action: "send_drawing",
    			subject,
    			img,
    			cli_hash
    		}));

    		$$invalidate(0, game_state = "waiting_screen");
    		$$invalidate(6, await_reason = "Waiting for all drawers to finish.");
    	}

    	function on_join_players() {
    		$$invalidate(0, game_state = "waiting_screen");
    		$$invalidate(6, await_reason = "Waiting more players.");
    		ws.send(JSON.stringify({ action: "join_players", name, cli_hash }));
    	}

    	function on_join_voters() {
    		$$invalidate(0, game_state = "waiting_screen");
    		$$invalidate(6, await_reason = "Waiting for players to finish their drawings.");
    		ws.send(JSON.stringify({ action: "join_voters" }));
    	}

    	function on_name_change(_name) {
    		$$invalidate(1, name = _name.detail);
    	}

    	function cast_vote(_data) {
    		let data = _data.detail;

    		if (disabled[data.subject]) {
    			alert("Already voted in this category.");
    			return;
    		}

    		let local_votes = votes;
    		local_votes[data.subject] = data.player_name;
    		votes_on_player[data.player_name] = votes_on_player[data.player_name] + 1;
    		$$invalidate(5, votes = local_votes);
    		$$invalidate(8, disabled[data.subject] = true, disabled);
    	}

    	function on_finish() {
    		$$invalidate(0, game_state = "waiting_screen");
    		$$invalidate(6, await_reason = "Waiting for all voters to cast their votes.");

    		ws.send(JSON.stringify({
    			action: "end_votes",
    			votes: votes_on_player
    		}));
    	}

    	function reset_client() {
    		$$invalidate(0, game_state = "menu");
    		$$invalidate(1, name = "");
    		$$invalidate(2, connected = false);
    		$$invalidate(3, subject_index = 0);
    		$$invalidate(4, game_content = {});
    		$$invalidate(5, votes = {});
    		$$invalidate(6, await_reason = "");
    		$$invalidate(7, subjects = []);
    		votes_on_player = {};
    		$$invalidate(9, results = {});
    		$$invalidate(8, disabled = {});
    		connect();
    	}

    	function handle_received_message(message) {
    		const j_message = JSON.parse(message.data);

    		switch (j_message.about) {
    			case "abort_game":
    				reset_client();
    				alert(j_message.reason + ". Finishing the game...");
    				break;
    			case "start_drawing":
    				$$invalidate(7, subjects = j_message.subjects);
    				$$invalidate(0, game_state = "drawing");
    				break;
    			case "next_drawing":
    				if (subject_index === subjects.length - 1) {
    					$$invalidate(0, game_state = "waiting_screen");
    					$$invalidate(6, await_reason = "Waiting for all voters to cast their votes.");
    					ws.send(JSON.stringify({ action: "ready_for_votes" }));
    				} else {
    					$$invalidate(3, subject_index = subject_index + 1);
    					$$invalidate(0, game_state = "drawing");
    				}
    				break;
    			case "votes":
    				j_message.player_names.forEach(player => {
    					votes_on_player[player] = 0;

    					for (let subject in subjects) {
    						$$invalidate(8, disabled[subject] = false, disabled);
    					}
    				});
    				$$invalidate(0, game_state = "votes");
    				$$invalidate(4, game_content = j_message.content);
    				break;
    			case "end_game":
    				$$invalidate(9, results = j_message.result);
    				$$invalidate(0, game_state = "results");
    				break;
    		}
    	}

    	function connect() {
    		let HOST = window.location.origin.replace(/^http/, "ws").replace(/:5000/, ":30000");
    		ws = new WebSocket(HOST);

    		ws.onopen = () => {
    			$$invalidate(2, connected = true);
    		};

    		ws.onmessage = msg => handle_received_message(msg);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GameState> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GameState", $$slots, []);

    	$$self.$capture_state = () => ({
    		GameMenu,
    		DrawingBoard,
    		VoteDrawings,
    		ResultsDisplayer,
    		onMount,
    		game_state,
    		name,
    		connected,
    		subject_index,
    		game_content,
    		votes,
    		await_reason,
    		subjects,
    		ws,
    		disabled,
    		cli_hash,
    		votes_on_player,
    		results,
    		on_next,
    		on_join_players,
    		on_join_voters,
    		on_name_change,
    		cast_vote,
    		on_finish,
    		reset_client,
    		handle_received_message,
    		connect
    	});

    	$$self.$inject_state = $$props => {
    		if ("game_state" in $$props) $$invalidate(0, game_state = $$props.game_state);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("connected" in $$props) $$invalidate(2, connected = $$props.connected);
    		if ("subject_index" in $$props) $$invalidate(3, subject_index = $$props.subject_index);
    		if ("game_content" in $$props) $$invalidate(4, game_content = $$props.game_content);
    		if ("votes" in $$props) $$invalidate(5, votes = $$props.votes);
    		if ("await_reason" in $$props) $$invalidate(6, await_reason = $$props.await_reason);
    		if ("subjects" in $$props) $$invalidate(7, subjects = $$props.subjects);
    		if ("ws" in $$props) ws = $$props.ws;
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("cli_hash" in $$props) cli_hash = $$props.cli_hash;
    		if ("votes_on_player" in $$props) votes_on_player = $$props.votes_on_player;
    		if ("results" in $$props) $$invalidate(9, results = $$props.results);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		game_state,
    		name,
    		connected,
    		subject_index,
    		game_content,
    		votes,
    		await_reason,
    		subjects,
    		disabled,
    		results,
    		on_next,
    		on_join_players,
    		on_join_voters,
    		on_name_change,
    		cast_vote,
    		on_finish,
    		reset_client
    	];
    }

    class GameState extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameState",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let gamestate;
    	let current;
    	gamestate = new GameState({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(gamestate.$$.fragment);
    			attr_dev(main, "class", "svelte-6hcj36");
    			add_location(main, file$5, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(gamestate, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamestate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamestate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(gamestate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ GameState });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
