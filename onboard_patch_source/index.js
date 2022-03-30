import { ProviderRpcErrorCode, SofiaProRegular } from '@web3-onboard/common';
import { Subject, BehaviorSubject, defer, firstValueFrom, fromEventPattern } from 'rxjs';
import { distinctUntilKeyChanged, pluck, filter, shareReplay, withLatestFrom, take, takeUntil, share, switchMap, mapTo } from 'rxjs/operators';
import bowser from 'bowser';
import Joi from 'joi';
import partition from 'lodash.partition';
import { providers, utils, BigNumber } from 'ethers';
import { addMessages, init as init$2, getLocaleFromNavigator, _ } from 'svelte-i18n';
import merge from 'lodash.merge';
import EventEmitter from 'eventemitter3';

const ADD_CHAINS = 'add_chains';
const RESET_STORE = 'reset_store';
const ADD_WALLET = 'add_wallet';
const UPDATE_WALLET = 'update_wallet';
const REMOVE_WALLET = 'remove_wallet';
const UPDATE_ACCOUNT = 'update_account';

const APP_INITIAL_STATE = {
    wallets: [],
    chains: []
};
const STORAGE_KEYS = {
    TERMS_AGREEMENT: 'onboard.js:agreement'
};

const notNullish = (value) => value != null;
function getDeviceInfo() {
    const parsed = bowser.getParser(window.navigator.userAgent);
    const os = parsed.getOS();
    const browser = parsed.getBrowser();
    const { type } = parsed.getPlatform();
    return {
        type: type,
        os: os,
        browser: browser
    };
}
function validEnsChain(chainId) {
    switch (chainId) {
        case '0x1':
        case '0x3':
        case '0x4':
        case '0x5':
            return true;
        default:
            return false;
    }
}
function isSVG(str) {
    return str.includes('<svg');
}

// observable to log actions or do sideeffects after every state change
const actions$ = new Subject();
function reducer(state, action) {
    const { type, payload } = action;
    switch (type) {
        case ADD_CHAINS:
            return {
                ...state,
                chains: [...state.chains, ...payload]
            };
        case ADD_WALLET: {
            const wallet = payload;
            const existingWallet = state.wallets.find(({ label }) => label === wallet.label);
            return {
                ...state,
                wallets: [
                    // add to front of wallets as it is now the primary wallet
                    existingWallet || payload,
                    // filter out wallet if it already existed
                    ...state.wallets.filter(({ label }) => label !== wallet.label)
                ]
            };
        }
        case UPDATE_WALLET: {
            const update = payload;
            const { id, ...walletUpdate } = update;
            const updatedWallets = state.wallets.map(wallet => wallet.label === id ? { ...wallet, ...walletUpdate } : wallet);
            return {
                ...state,
                wallets: updatedWallets
            };
        }
        case REMOVE_WALLET: {
            const update = payload;
            return {
                ...state,
                wallets: state.wallets.filter(({ label }) => label !== update.id)
            };
        }
        case UPDATE_ACCOUNT: {
            const update = payload;
            const { id, address, ...accountUpdate } = update;
            const updatedWallets = state.wallets.map(wallet => {
                if (wallet.label === id) {
                    wallet.accounts = wallet.accounts.map(account => {
                        if (account.address === address) {
                            return { ...account, ...accountUpdate };
                        }
                        return account;
                    });
                }
                return wallet;
            });
            return {
                ...state,
                wallets: updatedWallets
            };
        }
        case RESET_STORE:
            return APP_INITIAL_STATE;
        default:
            throw new Error(`Unknown type: ${type} in appStore reducer`);
    }
}
const _store = new BehaviorSubject(APP_INITIAL_STATE);
const _stateUpdates = new Subject();
_stateUpdates.subscribe(_store);
function dispatch$1(action) {
    const state = _store.getValue();
    actions$.next({ action, state });
    _stateUpdates.next(reducer(state, action));
}
function select(stateKey) {
    if (!stateKey)
        return _stateUpdates.asObservable();
    const validStateKeys = Object.keys(_store.getValue());
    if (!validStateKeys.includes(String(stateKey))) {
        throw new Error(`key: ${stateKey} does not exist on this store`);
    }
    return _stateUpdates
        .asObservable()
        .pipe(distinctUntilKeyChanged(stateKey), pluck(stateKey), filter(notNullish));
}
function get() {
    return _store.getValue();
}
const state = {
    select,
    get
};

function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
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
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}
function append(target, node) {
    target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
    const append_styles_to = get_root_for_style(target);
    if (!append_styles_to.getElementById(style_sheet_id)) {
        const style = element('style');
        style.id = style_sheet_id;
        style.textContent = styles;
        append_stylesheet(append_styles_to, style);
    }
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
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
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
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
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, bubbles = false) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, false, detail);
    return e;
}
class HtmlTag {
    constructor() {
        this.e = this.n = null;
    }
    c(html) {
        this.h(html);
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            this.e = element(target.nodeName);
            this.t = target;
            this.c(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
        rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        managed_styles.forEach(info => {
            const { stylesheet } = info;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            info.rules = {};
        });
        managed_styles.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        // @ts-ignore
        callbacks.slice().forEach(fn => fn.call(this, event));
    }
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
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
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
    seen_callbacks.clear();
    set_current_component(saved_component);
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

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            started = true;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = (program.b - t);
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program || pending_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            if (info.blocks[i] === block) {
                                info.blocks[i] = null;
                            }
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
            if (!info.hasCatch) {
                throw error;
            }
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}
function update_await_block_branch(info, ctx, dirty) {
    const child_ctx = ctx.slice();
    const { resolved } = info;
    if (info.current === info.then) {
        child_ctx[info.value] = resolved;
    }
    if (info.current === info.catch) {
        child_ctx[info.error] = resolved;
    }
    info.block.p(child_ctx, dirty);
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
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
    }
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
function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
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
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
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

const chainId = Joi.string().pattern(/^0x[0-9a-fA-F]+$/);
const chainNamespace = Joi.string().valid('evm');
const unknownObject = Joi.object().unknown();
// const address = Joi.string().regex(/^0x[a-fA-F0-9]{40}$/)
const chain = Joi.object({
    namespace: chainNamespace,
    id: chainId.required(),
    rpcUrl: Joi.string().required(),
    label: Joi.string().required(),
    token: Joi.string().required()
});
const connectedChain = Joi.object({
    namespace: chainNamespace.required(),
    id: chainId.required()
});
const ens = Joi.any().allow(Joi.object({
    name: Joi.string().required(),
    avatar: Joi.string(),
    contentHash: Joi.any().allow(Joi.string(), null),
    getText: Joi.function().arity(1).required()
}), null);
const balance = Joi.any().allow(Joi.object({
    eth: Joi.number()
}).unknown(), null);
const account = {
    address: Joi.string().required(),
    ens,
    balance
};
const chains = Joi.array().items(chain);
const accounts = Joi.array().items(account);
const wallet = Joi.object({
    label: Joi.string(),
    icon: Joi.string(),
    provider: unknownObject,
    instance: unknownObject,
    accounts,
    chains: Joi.array().items(connectedChain)
});
const recommendedWallet = Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().required()
});
const agreement = Joi.object({
    version: Joi.string().required(),
    termsUrl: Joi.string().uri(),
    privacyUrl: Joi.string().uri()
});
const appMetadata = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    icon: Joi.string().required(),
    logo: Joi.string(),
    gettingStartedGuide: Joi.string(),
    email: Joi.string(),
    appUrl: Joi.string(),
    explore: Joi.string(),
    recommendedInjectedWallets: Joi.array().items(recommendedWallet),
    agreement
});
Joi.object({
    label: Joi.string().required(),
    getInfo: Joi.function().arity(1).required(),
    getInterface: Joi.function().arity(1).required()
});
const walletModules = Joi.array().items(Joi.function()).required();
const initOptions = Joi.object({
    wallets: walletModules,
    chains: chains.required(),
    appMetadata: appMetadata,
    i18n: Joi.object().unknown()
});
const connectOptions = Joi.object({
    autoSelect: [
        Joi.object({
            label: Joi.string().required(),
            disableModals: Joi.boolean()
        }),
        Joi.string()
    ]
});
const disconnectOptions = Joi.object({
    label: Joi.string().required()
}).required();
const setChainOptions = Joi.object({
    chainId: chainId.required(),
    wallet: Joi.string()
});
function validate(validator, data) {
    const result = validator.validate(data);
    return result.error ? result : null;
}
function validateWallet(data) {
    return validate(wallet, data);
}
function validateInitOptions(data) {
    return validate(initOptions, data);
}
function validateConnectOptions(data) {
    return validate(connectOptions, data);
}
function validateDisconnectOptions(data) {
    return validate(disconnectOptions, data);
}
function validateString(str) {
    return validate(Joi.string().required(), str);
}
function validateSetChainOptions(data) {
    return validate(setChainOptions, data);
}

function addChains(chains) {
    // chains are validated on init
    const action = {
        type: ADD_CHAINS,
        payload: chains.map(({ namespace = 'evm', ...rest }) => ({
            ...rest,
            namespace
        }))
    };
    dispatch$1(action);
}
function addWallet(wallet) {
    const error = validateWallet(wallet);
    if (error) {
        console.error(error);
        throw error;
    }
    const action = {
        type: ADD_WALLET,
        payload: wallet
    };
    dispatch$1(action);
}
function updateWallet(id, update) {
    const error = validateWallet(update);
    if (error) {
        console.error(error);
        throw error;
    }
    const action = {
        type: UPDATE_WALLET,
        payload: {
            id,
            ...update
        }
    };
    dispatch$1(action);
}
function removeWallet(id) {
    const error = validateString(id);
    if (error) {
        throw error;
    }
    const action = {
        type: REMOVE_WALLET,
        payload: {
            id
        }
    };
    dispatch$1(action);
}
function updateAccount(id, address, update) {
    const action = {
        type: UPDATE_ACCOUNT,
        payload: {
            id,
            address,
            ...update
        }
    };
    dispatch$1(action);
}
function resetStore() {
    const action = {
        type: RESET_STORE
    };
    dispatch$1(action);
}

const reset$ = new Subject();
const disconnectWallet$ = new Subject();
const internalState$ = new BehaviorSubject({
    svelteInstance: null,
    walletModules: [],
    appMetadata: null,
    device: null
});
const connectWallet$ = new BehaviorSubject({ inProgress: false, actionRequired: '' });
const switchChainModal$ = new BehaviorSubject(null);
const wallets$ = state.select('wallets').pipe(shareReplay(1));
// reset logic
reset$.pipe(withLatestFrom(wallets$), pluck('1')).subscribe(wallets => {
    // disconnect all wallets
    wallets.forEach(({ label }) => {
        disconnectWallet$.next(label);
    });
    resetStore();
});
defer(() => {
    const subject = new Subject();
    onMount(() => {
        subject.next();
    });
    return subject.asObservable().pipe(take(1));
});
const onDestroy$ = defer(() => {
    const subject = new Subject();
    onDestroy(() => {
        subject.next();
    });
    return subject.asObservable().pipe(take(1));
});
defer(() => {
    const subject = new Subject();
    afterUpdate(() => {
        subject.next();
    });
    return subject.asObservable().pipe(takeUntil(onDestroy$));
});
defer(() => {
    const subject = new Subject();
    beforeUpdate(() => {
        subject.next();
    });
    return subject.asObservable().pipe(takeUntil(onDestroy$));
});

async function connect$1(options) {
    if (options) {
        const error = validateConnectOptions(options);
        if (error) {
            throw error;
        }
    }
    const { chains } = state.get();
    // Wallets require the chains for initializing providers,
    // so we must ensure at least one is set
    if (!chains.length)
        throw new Error('At least one chain must be set before attempting to connect a wallet');
    const { autoSelect } = options || {
        autoSelect: { label: '', disableModals: false }
    };
    connectWallet$.next({
        autoSelect: typeof autoSelect === 'string'
            ? { label: autoSelect, disableModals: false }
            : autoSelect,
        inProgress: true
    });
    const result$ = connectWallet$.pipe(filter(({ inProgress, actionRequired }) => inProgress === false && !actionRequired), withLatestFrom(wallets$), pluck(1));
    return firstValueFrom(result$);
}

async function disconnect(options) {
    const error = validateDisconnectOptions(options);
    if (error) {
        throw error;
    }
    const { label } = options;
    disconnectWallet$.next(label);
    removeWallet(label);
    return state.get().wallets;
}

const ethersProviders = {};
function requestAccounts(provider) {
    const args = { method: 'eth_requestAccounts' };
    return provider.request(args);
}
function selectAccounts(provider) {
    const args = { method: 'eth_selectAccounts' };
    return provider.request(args);
}
function getChainId(provider) {
    return provider.request({ method: 'eth_chainId' });
}
function listenAccountsChanged(args) {
    const { provider, disconnected$ } = args;
    const addHandler = (handler) => {
      if (provider.selectedProvider){
        provider.selectedProvider.on('accountsChanged', handler)
      } else {
        provider.on('accountsChanged', handler);
      }
    };
    const removeHandler = (handler) => {
      if (provider.selectedProvider){
        provider.selectProvider.removeListener('accountsChanged', handler)
      } else {
        provider.removeListener('accountsChanged', handler);
      }
    };
    return fromEventPattern(addHandler, removeHandler).pipe(takeUntil(disconnected$));
}
function listenChainChanged(args) {
    const { provider, disconnected$ } = args;
    const addHandler = (handler) => {
      if (provider.selectedProvider){
        provider.selectedProvider.on('chainChanged', handler)
      } else {
        provider.on('chainChanged', handler);
      }
    };
    const removeHandler = (handler) => {
      if (provider.selectedProvider){
        provider.selectedProvider.removeListener('chainChanged', handler)
      } else {
        provider.removeListener('chainChanged', handler);
      }
    };
    return fromEventPattern(addHandler, removeHandler).pipe(takeUntil(disconnected$));
}
function trackWallet(provider, label) {
    const disconnected$ = disconnectWallet$.pipe(filter(wallet => wallet === label), take(1));
    const accountsChanged$ = listenAccountsChanged({
        provider,
        disconnected$
    }).pipe(share());
    // when account changed, set it to first account
    accountsChanged$.subscribe(([address]) => {
        // no address, then no account connected, so disconnect wallet
        // this could happen if user locks wallet,
        // or if disconnects app from wallet
        if (!address) {
            disconnect({ label });
            return;
        }
        const { wallets } = state.get();
        const { accounts } = wallets.find(wallet => wallet.label === label);
        const [[existingAccount], restAccounts] = partition(accounts, account => account.address === address);
        // update accounts without ens and balance first
        updateWallet(label, {
            accounts: [
                existingAccount || { address: address, ens: null, balance: null },
                ...restAccounts
            ]
        });
    });
    // also when accounts change update Balance and ENS
    accountsChanged$
        .pipe(switchMap(async ([address]) => {
        if (!address)
            return;
        const { wallets, chains } = state.get();
        const { chains: walletChains, accounts } = wallets.find(wallet => wallet.label === label);
        const [connectedWalletChain] = walletChains;
        const chain = chains.find(({ namespace, id }) => namespace === 'evm' && id === connectedWalletChain.id);
        const balanceProm = getBalance(address, chain);
        const account = accounts.find(account => account.address === address);
        const ensProm = account.ens
            ? Promise.resolve(account.ens)
            : validEnsChain(connectedWalletChain.id)
                ? getEns(address, chain)
                : Promise.resolve(null);
        return Promise.all([Promise.resolve(address), balanceProm, ensProm]);
    }))
        .subscribe(res => {
        if (!res)
            return;
        const [address, balance, ens] = res;
        updateAccount(label, address, { balance, ens });
    });
    const chainChanged$ = listenChainChanged({ provider, disconnected$ }).pipe(share());
    // Update chain on wallet when chainId changed
    chainChanged$.subscribe(chainId => {
        const { wallets } = state.get();
        const { chains, accounts } = wallets.find(wallet => wallet.label === label);
        const [connectedWalletChain] = chains;
        if (chainId === connectedWalletChain.id)
            return;
        const resetAccounts = accounts.map(({ address }) => ({
            address,
            ens: null,
            balance: null
        }));
        updateWallet(label, {
            chains: [{ namespace: 'evm', id: chainId }],
            accounts: resetAccounts
        });
    });
    // when chain changes get ens and balance for each account for wallet
    chainChanged$
        .pipe(switchMap(async (chainId) => {
        const { wallets, chains } = state.get();
        const { accounts } = wallets.find(wallet => wallet.label === label);
        const chain = chains.find(({ namespace, id }) => namespace === 'evm' && id === chainId);
        return Promise.all(accounts.map(async ({ address }) => {
            const balanceProm = getBalance(address, chain);
            const ensProm = validEnsChain(chainId)
                ? getEns(address, chain)
                : Promise.resolve(null);
            const [balance, ens] = await Promise.all([balanceProm, ensProm]);
            return {
                address,
                balance,
                ens
            };
        }));
    }))
        .subscribe(updatedAccounts => {
        updatedAccounts && updateWallet(label, { accounts: updatedAccounts });
    });
    disconnected$.subscribe(() => {
        provider.disconnect && provider.disconnect();
    });
}
async function getEns(address, chain) {
    // chain we don't recognize and don't have a rpcUrl for requests
    if (!chain)
        return null;
    if (!ethersProviders[chain.rpcUrl]) {
        ethersProviders[chain.rpcUrl] = new providers.StaticJsonRpcProvider(chain.rpcUrl);
    }
    const provider = ethersProviders[chain.rpcUrl];
    try {
        const name = await provider.lookupAddress(address);
        let ens = null;
        if (name) {
            const resolver = await provider.getResolver(name);
            if (resolver) {
                const [contentHash, avatar] = await Promise.all([
                    resolver.getContentHash(),
                    resolver.getAvatar()
                ]);
                const getText = resolver.getText.bind(resolver);
                ens = {
                    name,
                    avatar,
                    contentHash,
                    getText
                };
            }
        }
        return ens;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
async function getBalance(address, chain) {
    // chain we don't recognize and don't have a rpcUrl for requests
    if (!chain)
        return null;
    if (!ethersProviders[chain.rpcUrl]) {
        ethersProviders[chain.rpcUrl] = new providers.StaticJsonRpcProvider(chain.rpcUrl);
    }
    const provider = ethersProviders[chain.rpcUrl];
    try {
        const balanceWei = await provider.getBalance(address);
        return balanceWei
            ? { [chain.token || 'eth']: utils.formatEther(balanceWei) }
            : null;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
function switchChain(provider, chainId) {
    const activeProvider = provider.selectedProvider || provider
    return activeProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
    });
}
function addNewChain(provider, chain) {
  const activeProvider = provider.selectedProvider || provider
    return activeProvider.request({
        method: 'wallet_addEthereumChain',
        params: [
            {
                chainId: chain.id,
                chainName: chain.label,
                nativeCurrency: {
                    name: chain.label,
                    symbol: chain.token,
                    decimals: 18
                },
                rpcUrls: [chain.rpcUrl]
            }
        ]
    });
}

async function setChain(options) {
    const error = validateSetChainOptions(options);
    if (error) {
        throw error;
    }
    const { wallets, chains } = state.get();
    const { chainId, chainNamespace = 'evm', wallet: walletToSet } = options;
    // validate that chainId has been added to chains
    const chain = chains.find(({ namespace, id }) => namespace === chainNamespace && id === chainId);
    if (!chain) {
        throw new Error(`Chain with chainId: ${chainId} and chainNamespace: ${chainNamespace} has not been set and must be added when Onboard is initialized.`);
    }
    const wallet = walletToSet
        ? wallets.find(({ label }) => label === walletToSet)
        : wallets[0];
    // validate a wallet is connected
    if (!wallet) {
        throw new Error(walletToSet
            ? `Wallet with label ${walletToSet} is not connected`
            : 'A wallet must be connected before a chain can be set');
    }
    const [walletConnectedChain] = wallet.chains;
    // check if wallet is already connected to chainId
    if (walletConnectedChain.namespace === chainNamespace &&
        walletConnectedChain.id === chainId) {
        return true;
    }
    try {
        await switchChain(wallet.provider, chainId);
        return true;
    }
    catch (error) {
        const { code } = error;
        const switchChainModalClosed$ = switchChainModal$.pipe(filter(x => x === null), mapTo(false));
        if (code === ProviderRpcErrorCode.CHAIN_NOT_ADDED) {
            // chain has not been added to wallet
            try {
                await addNewChain(wallet.provider, chain);
                await switchChain(wallet.provider, chainId);
                return true;
            }
            catch (error) {
                // display notification to user to switch chain
                switchChainModal$.next({ chain });
                return firstValueFrom(switchChainModalClosed$);
            }
        }
        if (code === ProviderRpcErrorCode.UNSUPPORTED_METHOD) {
            // method not supported
            switchChainModal$.next({ chain });
            return firstValueFrom(switchChainModalClosed$);
        }
    }
    return false;
}

var connect = {
	selectingWallet: {
		header: "Available Wallets",
		sidebar: {
			heading: "Get Started",
			subheading: "Connect your wallet",
			paragraph: "Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started."
		},
		recommendedWalletsPart1: "{app} only supports",
		recommendedWalletsPart2: "on this platform. Please use or install one of the supported wallets to continue",
		installWallet: "You do not have any wallets installed that {app} supports, please use a supported wallet",
		agreement: {
			agree: "I agree to the",
			terms: "Terms & Conditions",
			and: "and",
			privacy: "Privacy Policy"
		}
	},
	connectingWallet: {
		header: "{connectionRejected, select, false {Connecting to {wallet}...} other {Connection Rejected}}",
		sidebar: {
			subheading: "Approve Connection",
			paragraph: "Please approve the connection in your wallet and authorize access to continue."
		},
		mainText: "Connecting...",
		paragraph: "Make sure to select all accounts that you want to grant access to.",
		rejectedText: "Connection Rejected!",
		rejectedCTA: "Click here to try again",
		primaryButton: "Back to wallets"
	},
	connectedWallet: {
		header: "Connection Successful",
		sidebar: {
			subheading: "Connection Successful!",
			paragraph: "Your wallet is now connected to {app}"
		},
		mainText: "Connected"
	}
};
var modals = {
	actionRequired: {
		heading: "Action required in {wallet}",
		paragraph: "Please switch the active account in your wallet.",
		linkText: "Learn more.",
		buttonText: "Okay"
	},
	switchChain: {
		heading: "Switch Chain",
		paragraph1: "{app} requires that you switch your wallet to the {nextNetworkName} network to continue.",
		paragraph2: "*Some wallets may not support changing networks. If you can not change networks in your wallet you may consider switching to a different wallet."
	}
};
var en = {
	connect: connect,
	modals: modals
};

function initialize(options) {
    if (options) {
        const { en: customizedEn } = options;
        const merged = merge(en, customizedEn || {});
        addMessages('en', merged);
        const customLocales = Object.keys(options).filter(key => key !== 'en');
        // Sync register all customLocales
        customLocales.forEach(locale => {
            const dictionary = options[locale];
            dictionary && addMessages(locale, dictionary);
        });
    }
    else {
        addMessages('en', en);
    }
    init$2({
        fallbackLocale: 'en',
        initialLocale: getLocaleFromNavigator()
    });
}

var closeIcon = `
  <svg width="100%" height="100%" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6569 1.75736L7.41429 6L11.6569 10.2426L10.2427 11.6569L6.00008 7.41421L1.75744 11.6569L0.343227 10.2426L4.58587 6L0.343227 1.75736L1.75744 0.343146L6.00008 4.58579L10.2427 0.343146L11.6569 1.75736Z" fill="currentColor"/>
  </svg>
`;

/* src/views/shared/CloseButton.svelte generated by Svelte v3.46.4 */

function add_css$h(target) {
	append_styles(target, "svelte-fio0ht", ".close-button-container.svelte-fio0ht{cursor:pointer;display:flex;justify-content:center;align-items:center}.close-button.svelte-fio0ht{width:2rem;height:2rem;box-sizing:border-box;display:flex;justify-content:center;align-items:center;padding:0.4rem;background:var(\n      --onboard-close-button-background,\n      var(--onboard-gray-100, var(--gray-100))\n    );border-radius:40px;color:var(\n      --onboard-close-button-color,\n      var(--onboard-gray-400, var(--gray-400))\n    )}.close-icon.svelte-fio0ht{width:14px;display:flex;align-items:center}");
}

function create_fragment$h(ctx) {
	let div2;
	let div1;
	let div0;

	return {
		c() {
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			attr(div0, "class", "close-icon svelte-fio0ht");
			attr(div1, "class", "close-button svelte-fio0ht");
			attr(div2, "class", "close-button-container svelte-fio0ht");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div1);
			append(div1, div0);
			div0.innerHTML = closeIcon;
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div2);
		}
	};
}

class CloseButton extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, null, create_fragment$h, safe_not_equal, {}, add_css$h);
	}
}

function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}

/* src/views/shared/Modal.svelte generated by Svelte v3.46.4 */

function add_css$g(target) {
	append_styles(target, "svelte-lkspmm", "section.svelte-lkspmm{position:absolute;top:0;left:0;pointer-events:none;z-index:var(--onboard-modal-z-index, var(--modal-z-index))}.background.svelte-lkspmm{width:100vw;height:100vh;display:flex;justify-content:center;align-items:center;background:rgba(0, 0, 0, 0.6);pointer-events:all}.relative.svelte-lkspmm{position:relative;display:flex;max-height:calc(100vh - 2rem)}.modal-overflow.svelte-lkspmm{position:relative;overflow:hidden;border-radius:24px;display:flex;justify-content:center}.modal.svelte-lkspmm{position:relative;border-radius:24px;overflow-y:auto;background:white}@media all and (max-width: 520px){.relative.svelte-lkspmm{width:calc(100% - 1rem)}.modal-overflow.svelte-lkspmm{width:100%}.modal.svelte-lkspmm{width:100%}}");
}

function create_fragment$g(ctx) {
	let section;
	let div3;
	let div2;
	let div1;
	let div0;
	let section_transition;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	return {
		c() {
			section = element("section");
			div3 = element("div");
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			if (default_slot) default_slot.c();
			attr(div0, "class", "modal svelte-lkspmm");
			attr(div1, "class", "modal-overflow svelte-lkspmm");
			attr(div2, "class", "relative svelte-lkspmm");
			attr(div3, "class", "background svelte-lkspmm");
			attr(section, "class", "svelte-lkspmm");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, div3);
			append(div3, div2);
			append(div2, div1);
			append(div1, div0);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					listen(div2, "click", stop_propagation(/*click_handler*/ ctx[3])),
					listen(div3, "click", function () {
						if (is_function(/*close*/ ctx[0])) /*close*/ ctx[0].apply(this, arguments);
					})
				];

				mounted = true;
			}
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);

			add_render_callback(() => {
				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, {}, true);
				section_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, {}, false);
			section_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(section);
			if (default_slot) default_slot.d(detaching);
			if (detaching && section_transition) section_transition.end();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { close } = $$props;

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	$$self.$$set = $$props => {
		if ('close' in $$props) $$invalidate(0, close = $$props.close);
		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	return [close, $$scope, slots, click_handler];
}

class Modal extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$g, create_fragment$g, safe_not_equal, { close: 0 }, add_css$g);
	}
}

/* src/views/connect/Agreement.svelte generated by Svelte v3.46.4 */

function add_css$f(target) {
	append_styles(target, "svelte-1y8va6v", ".container.svelte-1y8va6v{display:flex;align-items:center;padding:var(--onboard-spacing-4, var(--spacing-4));font-size:var(--onboard-font-size-6, var(--font-size-6));line-height:24px}label.svelte-1y8va6v{display:flex;align-items:center}input.svelte-1y8va6v{height:1rem;width:1rem;margin-right:0.5rem}.spacer.svelte-1y8va6v{padding-top:var(--onboard-spacing-4, var(--spacing-4))}");
}

// (69:0) {:else}
function create_else_block$4(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "spacer svelte-1y8va6v");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (50:0) {#if showTermsOfService}
function create_if_block$9(ctx) {
	let div;
	let label;
	let input;
	let t0;
	let span;
	let t1_value = /*$_*/ ctx[1]('connect.selectingWallet.agreement.agree') + "";
	let t1;
	let t2;
	let t3_value = ' ' + "";
	let t3;
	let t4;
	let t5;
	let mounted;
	let dispose;
	let if_block0 = /*termsUrl*/ ctx[2] && create_if_block_2$3(ctx);
	let if_block1 = /*privacyUrl*/ ctx[3] && create_if_block_1$4(ctx);

	return {
		c() {
			div = element("div");
			label = element("label");
			input = element("input");
			t0 = space();
			span = element("span");
			t1 = text(t1_value);
			t2 = space();
			t3 = text(t3_value);
			t4 = space();
			if (if_block0) if_block0.c();
			t5 = space();
			if (if_block1) if_block1.c();
			attr(input, "class", " svelte-1y8va6v");
			attr(input, "type", "checkbox");
			attr(label, "class", "svelte-1y8va6v");
			attr(div, "class", "container svelte-1y8va6v");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, label);
			append(label, input);
			input.checked = /*agreed*/ ctx[0];
			append(label, t0);
			append(label, span);
			append(span, t1);
			append(span, t2);
			append(span, t3);
			append(span, t4);
			if (if_block0) if_block0.m(span, null);
			append(span, t5);
			if (if_block1) if_block1.m(span, null);

			if (!mounted) {
				dispose = listen(input, "change", /*input_change_handler*/ ctx[5]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*agreed*/ 1) {
				input.checked = /*agreed*/ ctx[0];
			}

			if (dirty & /*$_*/ 2 && t1_value !== (t1_value = /*$_*/ ctx[1]('connect.selectingWallet.agreement.agree') + "")) set_data(t1, t1_value);
			if (/*termsUrl*/ ctx[2]) if_block0.p(ctx, dirty);
			if (/*privacyUrl*/ ctx[3]) if_block1.p(ctx, dirty);
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			mounted = false;
			dispose();
		}
	};
}

// (57:8) {#if termsUrl}
function create_if_block_2$3(ctx) {
	let a;
	let t0_value = /*$_*/ ctx[1]('connect.selectingWallet.agreement.terms') + "";
	let t0;

	let t1_value = (/*privacyUrl*/ ctx[3]
	? ' ' + /*$_*/ ctx[1]('connect.selectingWallet.agreement.and') + ' '
	: '.') + "";

	let t1;

	return {
		c() {
			a = element("a");
			t0 = text(t0_value);
			t1 = text(t1_value);
			attr(a, "href", /*termsUrl*/ ctx[2]);
			attr(a, "target", "_blank");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, t0);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*$_*/ 2 && t0_value !== (t0_value = /*$_*/ ctx[1]('connect.selectingWallet.agreement.terms') + "")) set_data(t0, t0_value);

			if (dirty & /*$_*/ 2 && t1_value !== (t1_value = (/*privacyUrl*/ ctx[3]
			? ' ' + /*$_*/ ctx[1]('connect.selectingWallet.agreement.and') + ' '
			: '.') + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) detach(a);
			if (detaching) detach(t1);
		}
	};
}

// (63:8) {#if privacyUrl}
function create_if_block_1$4(ctx) {
	let a;
	let t0_value = /*$_*/ ctx[1]('connect.selectingWallet.agreement.privacy') + "";
	let t0;
	let t1;

	return {
		c() {
			a = element("a");
			t0 = text(t0_value);
			t1 = text(".");
			attr(a, "href", /*privacyUrl*/ ctx[3]);
			attr(a, "target", "_blank");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, t0);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*$_*/ 2 && t0_value !== (t0_value = /*$_*/ ctx[1]('connect.selectingWallet.agreement.privacy') + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) detach(a);
			if (detaching) detach(t1);
		}
	};
}

function create_fragment$f(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*showTermsOfService*/ ctx[4]) return create_if_block$9;
		return create_else_block$4;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if_block.p(ctx, dirty);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$f($$self, $$props, $$invalidate) {
	let $_;
	component_subscribe($$self, _, $$value => $$invalidate(1, $_ = $$value));
	let { agreed } = $$props;
	const { terms: termsAgreed, privacy: privacyAgreed, version: versionAgreed } = JSON.parse(localStorage.getItem(STORAGE_KEYS.TERMS_AGREEMENT) || '{}');

	const blankAgreement = {
		termsUrl: '',
		privacyUrl: '',
		version: ''
	};

	const { appMetadata } = internalState$.getValue();
	const { termsUrl, privacyUrl, version } = appMetadata && appMetadata.agreement || blankAgreement;
	const showTermsOfService = !!(termsUrl && !termsAgreed || privacyUrl && !privacyAgreed || version && version !== versionAgreed);
	agreed = !showTermsOfService;

	function input_change_handler() {
		agreed = this.checked;
		$$invalidate(0, agreed);
	}

	$$self.$$set = $$props => {
		if ('agreed' in $$props) $$invalidate(0, agreed = $$props.agreed);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*agreed*/ 1) {
			if (agreed) {
				localStorage.setItem(STORAGE_KEYS.TERMS_AGREEMENT, JSON.stringify({
					version,
					terms: !!termsUrl,
					privacy: !!privacyUrl
				}));
			} else if (agreed === false) {
				localStorage.removeItem(STORAGE_KEYS.TERMS_AGREEMENT);
			}
		}
	};

	return [agreed, $_, termsUrl, privacyUrl, showTermsOfService, input_change_handler];
}

class Agreement extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$f, create_fragment$f, safe_not_equal, { agreed: 0 }, add_css$f);
	}
}

var success = `
  <svg width="100%" height="100%" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5002 6.0998L1.4002 3.9998L0.700195 4.6998L3.5002 7.4998L9.5002 1.4998L8.8002 0.799805L3.5002 6.0998Z" fill="currentColor"/>
  </svg>
`;

/* src/views/shared/Spinner.svelte generated by Svelte v3.46.4 */

function add_css$e(target) {
	append_styles(target, "svelte-1nnukeb", ".loading-container.svelte-1nnukeb.svelte-1nnukeb{display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:inherit;font-size:inherit;color:inherit}span.svelte-1nnukeb.svelte-1nnukeb{font-family:inherit;font-size:0.889em;margin-top:1rem}.loading.svelte-1nnukeb.svelte-1nnukeb{display:inline-block;position:relative}.loading.svelte-1nnukeb div.svelte-1nnukeb{box-sizing:border-box;font-size:inherit;display:block;position:absolute;border:3px solid;border-radius:50%;animation:svelte-1nnukeb-bn-loading 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;border-color:currentColor transparent transparent transparent}.loading.svelte-1nnukeb .loading-first.svelte-1nnukeb{animation-delay:-0.45s}.loading.svelte-1nnukeb .loading-second.svelte-1nnukeb{animation-delay:-0.3s}.loading.svelte-1nnukeb .loading-third.svelte-1nnukeb{animation-delay:-0.15s}@keyframes svelte-1nnukeb-bn-loading{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}");
}

// (67:2) {#if description}
function create_if_block$8(ctx) {
	let span;
	let t;

	return {
		c() {
			span = element("span");
			t = text(/*description*/ ctx[0]);
			attr(span, "class", "svelte-1nnukeb");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*description*/ 1) set_data(t, /*description*/ ctx[0]);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

function create_fragment$e(ctx) {
	let div4;
	let div3;
	let div0;
	let div0_style_value;
	let t0;
	let div1;
	let div1_style_value;
	let t1;
	let div2;
	let div2_style_value;
	let div3_style_value;
	let t2;
	let if_block = /*description*/ ctx[0] && create_if_block$8(ctx);

	return {
		c() {
			div4 = element("div");
			div3 = element("div");
			div0 = element("div");
			t0 = space();
			div1 = element("div");
			t1 = space();
			div2 = element("div");
			t2 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "loading-first svelte-1nnukeb");
			attr(div0, "style", div0_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`);
			attr(div1, "class", "loading-second svelte-1nnukeb");
			attr(div1, "style", div1_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`);
			attr(div2, "class", "loading-third svelte-1nnukeb");
			attr(div2, "style", div2_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`);
			attr(div3, "class", "loading svelte-1nnukeb");
			attr(div3, "style", div3_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`);
			attr(div4, "class", "loading-container absolute svelte-1nnukeb");
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div3);
			append(div3, div0);
			append(div3, t0);
			append(div3, div1);
			append(div3, t1);
			append(div3, div2);
			append(div4, t2);
			if (if_block) if_block.m(div4, null);
		},
		p(ctx, [dirty]) {
			if (dirty & /*size*/ 2 && div0_style_value !== (div0_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`)) {
				attr(div0, "style", div0_style_value);
			}

			if (dirty & /*size*/ 2 && div1_style_value !== (div1_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`)) {
				attr(div1, "style", div1_style_value);
			}

			if (dirty & /*size*/ 2 && div2_style_value !== (div2_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`)) {
				attr(div2, "style", div2_style_value);
			}

			if (dirty & /*size*/ 2 && div3_style_value !== (div3_style_value = `height: ${/*size*/ ctx[1]}; width: ${/*size*/ ctx[1]};`)) {
				attr(div3, "style", div3_style_value);
			}

			if (/*description*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$8(ctx);
					if_block.c();
					if_block.m(div4, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div4);
			if (if_block) if_block.d();
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	let { description = '' } = $$props;
	let { size = '2rem' } = $$props;

	$$self.$$set = $$props => {
		if ('description' in $$props) $$invalidate(0, description = $$props.description);
		if ('size' in $$props) $$invalidate(1, size = $$props.size);
	};

	return [description, size];
}

class Spinner extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$e, create_fragment$e, safe_not_equal, { description: 0, size: 1 }, add_css$e);
	}
}

/* src/views/shared/WalletAppBadge.svelte generated by Svelte v3.46.4 */

function add_css$d(target) {
	append_styles(target, "svelte-1rtrnn2", ".icon-container.svelte-1rtrnn2{position:relative;border-radius:12px;box-sizing:border-box}.icon.svelte-1rtrnn2{display:flex;justify-content:center;align-items:center;height:100%}.border-yellow.svelte-1rtrnn2{border:1px solid var(--onboard-warning-500, var(--warning-500))}.border-gray.svelte-1rtrnn2{border:1px solid var(--onboard-gray-300, var(--gray-300))}.border-green.svelte-1rtrnn2{border:1px solid var(--onboard-success-500, var(--success-500))}.border-dark-green.svelte-1rtrnn2{border:1px solid var(--onboard-success-700, var(--success-700))}.border-blue.svelte-1rtrnn2{border:1px solid\n      var(\n        --onboard-wallet-app-icon-border-color,\n        var(--onboard-primary-300, var(--primary-300))\n      )}.border-dark-blue.svelte-1rtrnn2{border:1px solid\n      var(\n        --onboard-wallet-app-icon-border-color,\n        var(--onboard-primary-600, var(--primary-600))\n      )}.background-gray.svelte-1rtrnn2{background:var(--onboard-gray-500, var(--gray-500))}.background-light-gray.svelte-1rtrnn2{background:var(--onboard-gray-100, var(--gray-100))}.background-light-blue.svelte-1rtrnn2{background:var(--onboard-primary-100, var(--primary-100))}.background-green.svelte-1rtrnn2{background:var(--onboard-success-100, var(--success-100))}.background-white.svelte-1rtrnn2{background:var(--onboard-white, var(--white))}.background-transparent.svelte-1rtrnn2{background:transparent}@keyframes svelte-1rtrnn2-pulse{from{opacity:0}to{opacity:1}}.placeholder-icon.svelte-1rtrnn2{width:100%;height:100%;background:var(--onboard-gray-100, var(--gray-100));border-radius:32px;animation:svelte-1rtrnn2-pulse infinite 750ms alternate ease-in-out}.spinner-container.svelte-1rtrnn2{color:var(--onboard-primary-300, var(--primary-300))}img.svelte-1rtrnn2{max-width:100%;height:auto}");
}

const get_status_slot_changes = dirty => ({});
const get_status_slot_context = ctx => ({});

// (135:2) {:else}
function create_else_block$3(ctx) {
	let await_block_anchor;
	let promise;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 10
	};

	handle_promise(promise = /*icon*/ ctx[1], info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (dirty & /*icon*/ 2 && promise !== (promise = /*icon*/ ctx[1]) && handle_promise(promise, info)) ; else {
				update_await_block_branch(info, ctx, dirty);
			}
		},
		i(local) {
			transition_in(info.block);
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (131:2) {#if loading}
function create_if_block$7(ctx) {
	let div;
	let spinner;
	let current;
	spinner = new Spinner({ props: { size: "2rem" } });

	return {
		c() {
			div = element("div");
			create_component(spinner.$$.fragment);
			attr(div, "class", "spinner-container svelte-1rtrnn2");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(spinner, div, null);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(spinner.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(spinner.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(spinner);
		}
	};
}

// (1:0) <script lang="ts">import { fade }
function create_catch_block(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (138:4) {:then iconLoaded}
function create_then_block(ctx) {
	let div;
	let show_if;
	let div_intro;

	function select_block_type_1(ctx, dirty) {
		if (dirty & /*icon*/ 2) show_if = null;
		if (show_if == null) show_if = !!isSVG(/*iconLoaded*/ ctx[10]);
		if (show_if) return create_if_block_1$3;
		return create_else_block_1$1;
	}

	let current_block_type = select_block_type_1(ctx, -1);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "icon svelte-1rtrnn2");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		i(local) {
			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fade, {});
					div_intro.start();
				});
			}
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			if_block.d();
		}
	};
}

// (143:8) {:else}
function create_else_block_1$1(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			if (!src_url_equal(img.src, img_src_value = /*iconLoaded*/ ctx[10])) attr(img, "src", img_src_value);
			attr(img, "alt", "logo");
			attr(img, "class", "svelte-1rtrnn2");
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*icon*/ 2 && !src_url_equal(img.src, img_src_value = /*iconLoaded*/ ctx[10])) {
				attr(img, "src", img_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (140:8) {#if isSVG(iconLoaded)}
function create_if_block_1$3(ctx) {
	let html_tag;
	let raw_value = /*iconLoaded*/ ctx[10] + "";
	let html_anchor;

	return {
		c() {
			html_tag = new HtmlTag();
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		m(target, anchor) {
			html_tag.m(raw_value, target, anchor);
			insert(target, html_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*icon*/ 2 && raw_value !== (raw_value = /*iconLoaded*/ ctx[10] + "")) html_tag.p(raw_value);
		},
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (136:17)        <div class="placeholder-icon" />     {:then iconLoaded}
function create_pending_block(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "placeholder-icon svelte-1rtrnn2");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment$d(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let t;
	let div_style_value;
	let current;
	const if_block_creators = [create_if_block$7, create_else_block$3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*loading*/ ctx[2]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const status_slot_template = /*#slots*/ ctx[9].status;
	const status_slot = create_slot(status_slot_template, ctx, /*$$scope*/ ctx[8], get_status_slot_context);

	return {
		c() {
			div = element("div");
			if_block.c();
			t = space();
			if (status_slot) status_slot.c();
			attr(div, "class", "icon-container svelte-1rtrnn2");

			attr(div, "style", div_style_value = `${/*background*/ ctx[5] === 'custom'
			? /*customBackgroundColor*/ ctx[6]
			: ''}; padding: ${/*padding*/ ctx[3] - 1}px; width: ${/*size*/ ctx[0]}px; height: ${/*size*/ ctx[0]}px;`);

			toggle_class(div, "opaque", /*backgroundOpaque*/ ctx[7]);
			toggle_class(div, "border-yellow", /*border*/ ctx[4] === 'yellow');
			toggle_class(div, "border-gray", /*border*/ ctx[4] === 'gray');
			toggle_class(div, "border-green", /*border*/ ctx[4] === 'green');
			toggle_class(div, "border-dark-green", /*border*/ ctx[4] === 'darkGreen');
			toggle_class(div, "border-blue", /*border*/ ctx[4] === 'blue');
			toggle_class(div, "border-dark-blue", /*border*/ ctx[4] === 'darkBlue');
			toggle_class(div, "background-gray", /*background*/ ctx[5] === 'gray');
			toggle_class(div, "background-light-gray", /*background*/ ctx[5] === 'lightGray');
			toggle_class(div, "background-light-blue", /*background*/ ctx[5] === 'lightBlue');
			toggle_class(div, "background-green", /*background*/ ctx[5] === 'green');
			toggle_class(div, "background-white", /*background*/ ctx[5] === 'white');
			toggle_class(div, "background-transparent", /*background*/ ctx[5] === 'transparent');
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			append(div, t);

			if (status_slot) {
				status_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(div, t);
			}

			if (status_slot) {
				if (status_slot.p && (!current || dirty & /*$$scope*/ 256)) {
					update_slot_base(
						status_slot,
						status_slot_template,
						ctx,
						/*$$scope*/ ctx[8],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
						: get_slot_changes(status_slot_template, /*$$scope*/ ctx[8], dirty, get_status_slot_changes),
						get_status_slot_context
					);
				}
			}

			if (!current || dirty & /*background, customBackgroundColor, padding, size*/ 105 && div_style_value !== (div_style_value = `${/*background*/ ctx[5] === 'custom'
			? /*customBackgroundColor*/ ctx[6]
			: ''}; padding: ${/*padding*/ ctx[3] - 1}px; width: ${/*size*/ ctx[0]}px; height: ${/*size*/ ctx[0]}px;`)) {
				attr(div, "style", div_style_value);
			}

			if (dirty & /*backgroundOpaque*/ 128) {
				toggle_class(div, "opaque", /*backgroundOpaque*/ ctx[7]);
			}

			if (dirty & /*border*/ 16) {
				toggle_class(div, "border-yellow", /*border*/ ctx[4] === 'yellow');
			}

			if (dirty & /*border*/ 16) {
				toggle_class(div, "border-gray", /*border*/ ctx[4] === 'gray');
			}

			if (dirty & /*border*/ 16) {
				toggle_class(div, "border-green", /*border*/ ctx[4] === 'green');
			}

			if (dirty & /*border*/ 16) {
				toggle_class(div, "border-dark-green", /*border*/ ctx[4] === 'darkGreen');
			}

			if (dirty & /*border*/ 16) {
				toggle_class(div, "border-blue", /*border*/ ctx[4] === 'blue');
			}

			if (dirty & /*border*/ 16) {
				toggle_class(div, "border-dark-blue", /*border*/ ctx[4] === 'darkBlue');
			}

			if (dirty & /*background*/ 32) {
				toggle_class(div, "background-gray", /*background*/ ctx[5] === 'gray');
			}

			if (dirty & /*background*/ 32) {
				toggle_class(div, "background-light-gray", /*background*/ ctx[5] === 'lightGray');
			}

			if (dirty & /*background*/ 32) {
				toggle_class(div, "background-light-blue", /*background*/ ctx[5] === 'lightBlue');
			}

			if (dirty & /*background*/ 32) {
				toggle_class(div, "background-green", /*background*/ ctx[5] === 'green');
			}

			if (dirty & /*background*/ 32) {
				toggle_class(div, "background-white", /*background*/ ctx[5] === 'white');
			}

			if (dirty & /*background*/ 32) {
				toggle_class(div, "background-transparent", /*background*/ ctx[5] === 'transparent');
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(status_slot, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(status_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if_blocks[current_block_type_index].d();
			if (status_slot) status_slot.d(detaching);
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { size } = $$props;
	let { icon } = $$props;
	let { loading = false } = $$props;
	let { padding = size / 6 } = $$props;
	let { border = 'blue' } = $$props;
	let { background = 'white' } = $$props;
	let { customBackgroundColor = '' } = $$props;
	let { backgroundOpaque = false } = $$props;

	$$self.$$set = $$props => {
		if ('size' in $$props) $$invalidate(0, size = $$props.size);
		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
		if ('padding' in $$props) $$invalidate(3, padding = $$props.padding);
		if ('border' in $$props) $$invalidate(4, border = $$props.border);
		if ('background' in $$props) $$invalidate(5, background = $$props.background);
		if ('customBackgroundColor' in $$props) $$invalidate(6, customBackgroundColor = $$props.customBackgroundColor);
		if ('backgroundOpaque' in $$props) $$invalidate(7, backgroundOpaque = $$props.backgroundOpaque);
		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
	};

	return [
		size,
		icon,
		loading,
		padding,
		border,
		background,
		customBackgroundColor,
		backgroundOpaque,
		$$scope,
		slots
	];
}

class WalletAppBadge extends SvelteComponent {
	constructor(options) {
		super();

		init$1(
			this,
			options,
			instance$d,
			create_fragment$d,
			safe_not_equal,
			{
				size: 0,
				icon: 1,
				loading: 2,
				padding: 3,
				border: 4,
				background: 5,
				customBackgroundColor: 6,
				backgroundOpaque: 7
			},
			add_css$d
		);
	}
}

var defaultAppIcon = `
<svg height="80%" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.07004 9.85C5.84004 8.46 7.32004 7.64 8.18004 6.41C9.09004 5.12 8.58004 2.71 6.00004 2.71C4.31004 2.71 3.48004 3.99 3.13004 5.05L0.540039 3.96C1.25004 1.83 3.18004 0 5.99004 0C8.34004 0 9.95004 1.07 10.77 2.41C11.47 3.56 11.88 5.71 10.8 7.31C9.60004 9.08 8.45004 9.62 7.83004 10.76C7.58004 11.22 7.48004 11.52 7.48004 13H4.59004C4.58004 12.22 4.46004 10.95 5.07004 9.85ZM8.00004 17C8.00004 18.1 7.10004 19 6.00004 19C4.90004 19 4.00004 18.1 4.00004 17C4.00004 15.9 4.90004 15 6.00004 15C7.10004 15 8.00004 15.9 8.00004 17Z" fill="#999CA5"/>
</svg>
`;

/* src/views/shared/SuccessStatusIcon.svelte generated by Svelte v3.46.4 */

function add_css$c(target) {
	append_styles(target, "svelte-sv0as5", ".icon.svelte-sv0as5{display:flex;color:var(--onboard-white, var(--white));border-radius:50px;box-sizing:border-box;position:absolute;z-index:1}.green.svelte-sv0as5{background:var(--onboard-success-600, var(--success-600))}.blue.svelte-sv0as5{background:var(--onboard-primary-1, var(--primary-1))}");
}

function create_fragment$c(ctx) {
	let div;
	let div_style_value;

	return {
		c() {
			div = element("div");
			attr(div, "class", "icon svelte-sv0as5");

			attr(div, "style", div_style_value = `width: ${/*size*/ ctx[0]}px; height: ${/*size*/ ctx[0]}px; padding: ${/*size*/ ctx[0] / 5}px; ${/*bottom*/ ctx[2] !== null
			? `bottom: ${/*bottom*/ ctx[2]}px;`
			: ''} ${/*right*/ ctx[3] !== null
			? `right: ${/*right*/ ctx[3]}px;`
			: ''}`);

			toggle_class(div, "green", /*color*/ ctx[1] === 'green');
			toggle_class(div, "blue", /*color*/ ctx[1] === 'blue');
		},
		m(target, anchor) {
			insert(target, div, anchor);
			div.innerHTML = success;
		},
		p(ctx, [dirty]) {
			if (dirty & /*size, bottom, right*/ 13 && div_style_value !== (div_style_value = `width: ${/*size*/ ctx[0]}px; height: ${/*size*/ ctx[0]}px; padding: ${/*size*/ ctx[0] / 5}px; ${/*bottom*/ ctx[2] !== null
			? `bottom: ${/*bottom*/ ctx[2]}px;`
			: ''} ${/*right*/ ctx[3] !== null
			? `right: ${/*right*/ ctx[3]}px;`
			: ''}`)) {
				attr(div, "style", div_style_value);
			}

			if (dirty & /*color*/ 2) {
				toggle_class(div, "green", /*color*/ ctx[1] === 'green');
			}

			if (dirty & /*color*/ 2) {
				toggle_class(div, "blue", /*color*/ ctx[1] === 'blue');
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$c($$self, $$props, $$invalidate) {
	let { size } = $$props;
	let { color = 'green' } = $$props;
	let { bottom = -4 } = $$props;
	let { right = -4 } = $$props;

	$$self.$$set = $$props => {
		if ('size' in $$props) $$invalidate(0, size = $$props.size);
		if ('color' in $$props) $$invalidate(1, color = $$props.color);
		if ('bottom' in $$props) $$invalidate(2, bottom = $$props.bottom);
		if ('right' in $$props) $$invalidate(3, right = $$props.right);
	};

	return [size, color, bottom, right];
}

class SuccessStatusIcon extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$c, create_fragment$c, safe_not_equal, { size: 0, color: 1, bottom: 2, right: 3 }, add_css$c);
	}
}

/* src/views/connect/ConnectedWallet.svelte generated by Svelte v3.46.4 */

function add_css$b(target) {
	append_styles(target, "svelte-1cswia4", ".container.svelte-1cswia4{padding:var(--onboard-spacing-4, var(--spacing-4))}.connecting-container.svelte-1cswia4{display:flex;justify-content:space-between;align-items:center;padding:var(--onboard-spacing-4, var(--spacing-4));border-radius:24px;background:var(--onboard-success-100, var(--success-100));border:1px solid var(--onboard-success-600, var(--success-600));width:100%;box-sizing:border-box}.icons.svelte-1cswia4{display:flex;justify-content:center;position:relative}.text.svelte-1cswia4{position:relative;right:var(--onboard-spacing-5, var(--spacing-5))}.tick.svelte-1cswia4{display:flex;color:var(--onboard-success-700, var(--success-700))}@media all and (max-width: 520px){}");
}

function create_fragment$b(ctx) {
	let div6;
	let div5;
	let div2;
	let walletappbadge0;
	let t0;
	let div0;
	let successstatusicon;
	let t1;
	let div1;
	let walletappbadge1;
	let t2;
	let div3;

	let t3_value = /*$_*/ ctx[1]('connect.connectedWallet.mainText', {
		default: en.connect.connectedWallet.mainText
	}) + "";

	let t3;
	let t4;
	let div4;
	let current;

	walletappbadge0 = new WalletAppBadge({
			props: {
				size: 40,
				padding: 8,
				background: /*appMetadata*/ ctx[2] && /*appMetadata*/ ctx[2].icon
				? 'lightBlue'
				: 'lightGray',
				border: "darkGreen",
				icon: /*appMetadata*/ ctx[2] && /*appMetadata*/ ctx[2].icon || defaultAppIcon
			}
		});

	successstatusicon = new SuccessStatusIcon({ props: { size: 17, right: null } });

	walletappbadge1 = new WalletAppBadge({
			props: {
				size: 40,
				padding: 8,
				border: "darkGreen",
				icon: /*selectedWallet*/ ctx[0].icon
			}
		});

	return {
		c() {
			div6 = element("div");
			div5 = element("div");
			div2 = element("div");
			create_component(walletappbadge0.$$.fragment);
			t0 = space();
			div0 = element("div");
			create_component(successstatusicon.$$.fragment);
			t1 = space();
			div1 = element("div");
			create_component(walletappbadge1.$$.fragment);
			t2 = space();
			div3 = element("div");
			t3 = text(t3_value);
			t4 = space();
			div4 = element("div");
			set_style(div0, "position", "relative");
			set_style(div0, "right", "0.85rem");
			set_style(div0, "top", "2px");
			set_style(div1, "position", "relative");
			set_style(div1, "right", "0.5rem");
			attr(div2, "class", "icons svelte-1cswia4");
			attr(div3, "class", "text svelte-1cswia4");
			attr(div4, "class", "tick svelte-1cswia4");
			set_style(div4, "width", "20px");
			attr(div5, "class", "connecting-container svelte-1cswia4");
			attr(div6, "class", "container svelte-1cswia4");
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, div5);
			append(div5, div2);
			mount_component(walletappbadge0, div2, null);
			append(div2, t0);
			append(div2, div0);
			mount_component(successstatusicon, div0, null);
			append(div2, t1);
			append(div2, div1);
			mount_component(walletappbadge1, div1, null);
			append(div5, t2);
			append(div5, div3);
			append(div3, t3);
			append(div5, t4);
			append(div5, div4);
			div4.innerHTML = success;
			current = true;
		},
		p(ctx, [dirty]) {
			const walletappbadge1_changes = {};
			if (dirty & /*selectedWallet*/ 1) walletappbadge1_changes.icon = /*selectedWallet*/ ctx[0].icon;
			walletappbadge1.$set(walletappbadge1_changes);

			if ((!current || dirty & /*$_*/ 2) && t3_value !== (t3_value = /*$_*/ ctx[1]('connect.connectedWallet.mainText', {
				default: en.connect.connectedWallet.mainText
			}) + "")) set_data(t3, t3_value);
		},
		i(local) {
			if (current) return;
			transition_in(walletappbadge0.$$.fragment, local);
			transition_in(successstatusicon.$$.fragment, local);
			transition_in(walletappbadge1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(walletappbadge0.$$.fragment, local);
			transition_out(successstatusicon.$$.fragment, local);
			transition_out(walletappbadge1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div6);
			destroy_component(walletappbadge0);
			destroy_component(successstatusicon);
			destroy_component(walletappbadge1);
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let $_;
	component_subscribe($$self, _, $$value => $$invalidate(1, $_ = $$value));
	let { selectedWallet } = $$props;
	const { appMetadata } = internalState$.getValue();

	$$self.$$set = $$props => {
		if ('selectedWallet' in $$props) $$invalidate(0, selectedWallet = $$props.selectedWallet);
	};

	return [selectedWallet, $_, appMetadata];
}

class ConnectedWallet extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$b, create_fragment$b, safe_not_equal, { selectedWallet: 0 }, add_css$b);
	}
}

/* src/views/connect/ConnectingWallet.svelte generated by Svelte v3.46.4 */

function add_css$a(target) {
	append_styles(target, "svelte-gfxo3f", ".container.svelte-gfxo3f{display:flex;flex-direction:column;align-items:center;padding:var(--onboard-spacing-4, var(--spacing-4))}.connecting-container.svelte-gfxo3f{display:flex;justify-content:space-between;align-items:center;width:100%;padding:var(--onboard-spacing-4, var(--spacing-4));transition:background-color 100ms ease-in-out,\n      border-color 100ms ease-in-out;border-radius:24px;background-color:var(--onboard-primary-100, var(--primary-100));border:1px solid;border-color:var(--onboard-primary-300, var(--primary-300));box-sizing:border-box;color:var(--onboard-gray-600, var(--gray-600))}.connecting-container.warning.svelte-gfxo3f{background-color:var(--onboard-warning-100, var(--warning-100));border-color:var(--onboard-warning-400, var(--warning-400))}.icons.svelte-gfxo3f{display:flex;justify-content:center;position:relative}.text.svelte-gfxo3f{line-height:16px;margin-bottom:var(--onboard-spacing-5, var(--spacing-5))}.text.text-rejected.svelte-gfxo3f{line-height:24px;margin-bottom:0}.subtext.svelte-gfxo3f{font-size:var(--onboard-font-size-7, var(--font-size-7));line-height:16px}.rejected-cta.svelte-gfxo3f{color:var(--onboard-primary-500, var(--primary-500));cursor:pointer}.onboard-button-primary.svelte-gfxo3f{position:absolute;bottom:var(--onboard-spacing-3, var(--spacing-3))}.centered-flex-column.svelte-gfxo3f{display:flex;flex-direction:column;justify-content:center}.ml.svelte-gfxo3f{margin-left:var(--onboard-spacing-4, var(--spacing-4))}");
}

// (127:8) {:else}
function create_else_block$2(ctx) {
	let div;

	let t_value = /*$_*/ ctx[5]('connect.connectingWallet.paragraph', {
		default: en.connect.connectingWallet.paragraph
	}) + "";

	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "subtext svelte-gfxo3f");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty & /*$_*/ 32 && t_value !== (t_value = /*$_*/ ctx[5]('connect.connectingWallet.paragraph', {
				default: en.connect.connectingWallet.paragraph
			}) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (121:8) {#if connectionRejected}
function create_if_block$6(ctx) {
	let div;

	let t_value = /*$_*/ ctx[5]('connect.connectingWallet.rejectedCTA', {
		default: en.connect.connectingWallet.rejectedCTA
	}) + "";

	let t;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "rejected-cta subtext svelte-gfxo3f");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);

			if (!mounted) {
				dispose = listen(div, "click", function () {
					if (is_function(/*connectWallet*/ ctx[0])) /*connectWallet*/ ctx[0].apply(this, arguments);
				});

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty & /*$_*/ 32 && t_value !== (t_value = /*$_*/ ctx[5]('connect.connectingWallet.rejectedCTA', {
				default: en.connect.connectingWallet.rejectedCTA
			}) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$a(ctx) {
	let div6;
	let div5;
	let div4;
	let div1;
	let walletappbadge0;
	let t0;
	let div0;
	let walletappbadge1;
	let t1;
	let div3;
	let div2;

	let t2_value = /*$_*/ ctx[5](
		/*connectionRejected*/ ctx[4]
		? 'connect.connectingWallet.rejectedText'
		: 'connect.connectingWallet.mainText',
		{
			default: /*connectionRejected*/ ctx[4]
			? en.connect.connectingWallet.rejectedText
			: en.connect.connectingWallet.mainText
		}
	) + "";

	let t2;
	let t3;
	let t4;
	let button;

	let t5_value = /*$_*/ ctx[5]('connect.connectingWallet.primaryButton', {
		default: en.connect.connectingWallet.primaryButton
	}) + "";

	let t5;
	let current;
	let mounted;
	let dispose;

	walletappbadge0 = new WalletAppBadge({
			props: {
				size: 40,
				padding: 8,
				icon: /*appMetadata*/ ctx[6] && /*appMetadata*/ ctx[6].icon || defaultAppIcon,
				border: /*connectionRejected*/ ctx[4] ? 'yellow' : 'blue',
				background: "lightGray"
			}
		});

	walletappbadge1 = new WalletAppBadge({
			props: {
				size: 40,
				padding: 8,
				border: /*connectionRejected*/ ctx[4] ? 'yellow' : 'blue',
				background: "white",
				icon: /*selectedWallet*/ ctx[1].icon
			}
		});

	function select_block_type(ctx, dirty) {
		if (/*connectionRejected*/ ctx[4]) return create_if_block$6;
		return create_else_block$2;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div6 = element("div");
			div5 = element("div");
			div4 = element("div");
			div1 = element("div");
			create_component(walletappbadge0.$$.fragment);
			t0 = space();
			div0 = element("div");
			create_component(walletappbadge1.$$.fragment);
			t1 = space();
			div3 = element("div");
			div2 = element("div");
			t2 = text(t2_value);
			t3 = space();
			if_block.c();
			t4 = space();
			button = element("button");
			t5 = text(t5_value);
			set_style(div0, "position", "relative");
			set_style(div0, "right", "0.5rem");
			attr(div1, "class", "icons svelte-gfxo3f");
			attr(div2, "class", "text svelte-gfxo3f");
			toggle_class(div2, "text-rejected", /*connectionRejected*/ ctx[4]);
			attr(div3, "class", "centered-flex-column ml svelte-gfxo3f");
			set_style(div4, "display", "flex");
			attr(div5, "class", "connecting-container svelte-gfxo3f");
			toggle_class(div5, "warning", /*connectionRejected*/ ctx[4]);
			attr(button, "class", "onboard-button-primary svelte-gfxo3f");
			attr(div6, "class", "container svelte-gfxo3f");
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, div5);
			append(div5, div4);
			append(div4, div1);
			mount_component(walletappbadge0, div1, null);
			append(div1, t0);
			append(div1, div0);
			mount_component(walletappbadge1, div0, null);
			append(div4, t1);
			append(div4, div3);
			append(div3, div2);
			append(div2, t2);
			append(div3, t3);
			if_block.m(div3, null);
			append(div6, t4);
			append(div6, button);
			append(button, t5);
			current = true;

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[7]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const walletappbadge0_changes = {};
			if (dirty & /*connectionRejected*/ 16) walletappbadge0_changes.border = /*connectionRejected*/ ctx[4] ? 'yellow' : 'blue';
			walletappbadge0.$set(walletappbadge0_changes);
			const walletappbadge1_changes = {};
			if (dirty & /*connectionRejected*/ 16) walletappbadge1_changes.border = /*connectionRejected*/ ctx[4] ? 'yellow' : 'blue';
			if (dirty & /*selectedWallet*/ 2) walletappbadge1_changes.icon = /*selectedWallet*/ ctx[1].icon;
			walletappbadge1.$set(walletappbadge1_changes);

			if ((!current || dirty & /*$_, connectionRejected*/ 48) && t2_value !== (t2_value = /*$_*/ ctx[5](
				/*connectionRejected*/ ctx[4]
				? 'connect.connectingWallet.rejectedText'
				: 'connect.connectingWallet.mainText',
				{
					default: /*connectionRejected*/ ctx[4]
					? en.connect.connectingWallet.rejectedText
					: en.connect.connectingWallet.mainText
				}
			) + "")) set_data(t2, t2_value);

			if (dirty & /*connectionRejected*/ 16) {
				toggle_class(div2, "text-rejected", /*connectionRejected*/ ctx[4]);
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div3, null);
				}
			}

			if (dirty & /*connectionRejected*/ 16) {
				toggle_class(div5, "warning", /*connectionRejected*/ ctx[4]);
			}

			if ((!current || dirty & /*$_*/ 32) && t5_value !== (t5_value = /*$_*/ ctx[5]('connect.connectingWallet.primaryButton', {
				default: en.connect.connectingWallet.primaryButton
			}) + "")) set_data(t5, t5_value);
		},
		i(local) {
			if (current) return;
			transition_in(walletappbadge0.$$.fragment, local);
			transition_in(walletappbadge1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(walletappbadge0.$$.fragment, local);
			transition_out(walletappbadge1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div6);
			destroy_component(walletappbadge0);
			destroy_component(walletappbadge1);
			if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let $_;
	component_subscribe($$self, _, $$value => $$invalidate(5, $_ = $$value));
	let { connectWallet } = $$props;
	let { selectedWallet } = $$props;
	let { deselectWallet } = $$props;
	let { setStep } = $$props;
	let { connectionRejected } = $$props;
	const { appMetadata } = internalState$.getValue();

	const click_handler = () => {
		deselectWallet(selectedWallet.label);
		setStep('selectingWallet');
	};

	$$self.$$set = $$props => {
		if ('connectWallet' in $$props) $$invalidate(0, connectWallet = $$props.connectWallet);
		if ('selectedWallet' in $$props) $$invalidate(1, selectedWallet = $$props.selectedWallet);
		if ('deselectWallet' in $$props) $$invalidate(2, deselectWallet = $$props.deselectWallet);
		if ('setStep' in $$props) $$invalidate(3, setStep = $$props.setStep);
		if ('connectionRejected' in $$props) $$invalidate(4, connectionRejected = $$props.connectionRejected);
	};

	return [
		connectWallet,
		selectedWallet,
		deselectWallet,
		setStep,
		connectionRejected,
		$_,
		appMetadata,
		click_handler
	];
}

class ConnectingWallet extends SvelteComponent {
	constructor(options) {
		super();

		init$1(
			this,
			options,
			instance$a,
			create_fragment$a,
			safe_not_equal,
			{
				connectWallet: 0,
				selectedWallet: 1,
				deselectWallet: 2,
				setStep: 3,
				connectionRejected: 4
			},
			add_css$a
		);
	}
}

var infoIcon = `
<svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 0.5C3.86 0.5 0.5 3.86 0.5 8C0.5 12.14 3.86 15.5 8 15.5C12.14 15.5 15.5 12.14 15.5 8C15.5 3.86 12.14 0.5 8 0.5ZM8.75 11.75H7.25L7.25 7.25L8.75 7.25L8.75 11.75ZM8.75 5.75L7.25 5.75L7.25 4.25H8.75L8.75 5.75Z" fill="currentColor"/>
</svg>
`;

/* src/views/shared/Warning.svelte generated by Svelte v3.46.4 */

function add_css$9(target) {
	append_styles(target, "svelte-2c2etc", ".container.svelte-2c2etc{display:flex;justify-content:space-between;padding:var(--onboard-spacing-5, var(--spacing-5));color:var(--onboard-warning-700, var(--warning-700));font-size:var(--onboard-font-size-7, var(--font-size-7));line-height:16px;border:1px solid var(--onboard-warning-400, var(--warning-400));background-color:var(--onboard-warning-100, var(--warning-100));margin:0;border-radius:12px}.icon.svelte-2c2etc{color:var(--onboard-warning-700, var(--warning-700));width:1rem;height:1rem;margin-left:var(--onboard-spacing-5, var(--spacing-5))}p.svelte-2c2etc{margin:0;width:fit-content}");
}

function create_fragment$9(ctx) {
	let div1;
	let p;
	let t;
	let div0;
	let div1_intro;
	let current;
	const default_slot_template = /*#slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

	return {
		c() {
			div1 = element("div");
			p = element("p");
			if (default_slot) default_slot.c();
			t = space();
			div0 = element("div");
			attr(p, "class", "svelte-2c2etc");
			attr(div0, "class", "icon svelte-2c2etc");
			attr(div1, "class", "container svelte-2c2etc");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, p);

			if (default_slot) {
				default_slot.m(p, null);
			}

			append(div1, t);
			append(div1, div0);
			div0.innerHTML = infoIcon;
			current = true;
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[0],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);

			if (!div1_intro) {
				add_render_callback(() => {
					div1_intro = create_in_transition(div1, fade, {});
					div1_intro.start();
				});
			}

			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;

	$$self.$$set = $$props => {
		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
	};

	return [$$scope, slots];
}

class Warning extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$9, create_fragment$9, safe_not_equal, {}, add_css$9);
	}
}

/* src/views/connect/InstallWallet.svelte generated by Svelte v3.46.4 */

function add_css$8(target) {
	append_styles(target, "svelte-up669r", ".outer-container.svelte-up669r{padding:var(--onboard-spacing-4, var(--spacing-4))}.link.svelte-up669r{font-size:var(--onboard-font-size-7, var(--font-size-7));line-height:16px;color:var(--onboard-primary-500, var(--primary-500));cursor:pointer;text-decoration:none}");
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[2] = list[i].name;
	child_ctx[3] = list[i].url;
	child_ctx[5] = i;
	return child_ctx;
}

// (38:4) {:else}
function create_else_block$1(ctx) {
	let t_value = /*$_*/ ctx[0]('connect.selectingWallet.installWallet', {
		default: en.connect.selectingWallet.installWallet,
		values: { app: /*name*/ ctx[2] || 'this app' }
	}) + "";

	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*$_*/ 1 && t_value !== (t_value = /*$_*/ ctx[0]('connect.selectingWallet.installWallet', {
				default: en.connect.selectingWallet.installWallet,
				values: { app: /*name*/ ctx[2] || 'this app' }
			}) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (23:4) {#if recommendedInjectedWallets}
function create_if_block$5(ctx) {
	let t0_value = /*$_*/ ctx[0]('connect.selectingWallet.recommendedWalletsPart1', {
		default: en.connect.selectingWallet.recommendedWalletsPart1,
		values: { app: /*name*/ ctx[2] || 'This app' }
	}) + "";

	let t0;
	let t1;
	let t2;

	let t3_value = /*$_*/ ctx[0]('connect.selectingWallet.recommendedWalletsPart2', {
		default: en.connect.selectingWallet.recommendedWalletsPart2
	}) + "";

	let t3;
	let each_value = /*recommendedInjectedWallets*/ ctx[1];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c() {
			t0 = text(t0_value);
			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t2 = space();
			t3 = text(t3_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, t2, anchor);
			insert(target, t3, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*$_*/ 1 && t0_value !== (t0_value = /*$_*/ ctx[0]('connect.selectingWallet.recommendedWalletsPart1', {
				default: en.connect.selectingWallet.recommendedWalletsPart1,
				values: { app: /*name*/ ctx[2] || 'This app' }
			}) + "")) set_data(t0, t0_value);

			if (dirty & /*recommendedInjectedWallets*/ 2) {
				each_value = /*recommendedInjectedWallets*/ ctx[1];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(t2.parentNode, t2);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*$_*/ 1 && t3_value !== (t3_value = /*$_*/ ctx[0]('connect.selectingWallet.recommendedWalletsPart2', {
				default: en.connect.selectingWallet.recommendedWalletsPart2
			}) + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
			destroy_each(each_blocks, detaching);
			if (detaching) detach(t2);
			if (detaching) detach(t3);
		}
	};
}

// (30:6) {#each recommendedInjectedWallets as { name, url }
function create_each_block$1(ctx) {
	let a;
	let t0_value = /*name*/ ctx[2] + "";
	let t0;

	let t1_value = (/*i*/ ctx[5] < /*recommendedInjectedWallets*/ ctx[1].length - 1
	? ', '
	: '') + "";

	let t1;
	let a_href_value;

	return {
		c() {
			a = element("a");
			t0 = text(t0_value);
			t1 = text(t1_value);
			attr(a, "class", "link svelte-up669r");
			attr(a, "href", a_href_value = /*url*/ ctx[3]);
			attr(a, "target", "_blank");
			attr(a, "rel", "noreferrer noopener");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, t0);
			append(a, t1);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(a);
		}
	};
}

// (22:2) <Warning>
function create_default_slot$4(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*recommendedInjectedWallets*/ ctx[1]) return create_if_block$5;
		return create_else_block$1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if_block.p(ctx, dirty);
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$8(ctx) {
	let div;
	let warning;
	let current;

	warning = new Warning({
			props: {
				$$slots: { default: [create_default_slot$4] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			div = element("div");
			create_component(warning.$$.fragment);
			attr(div, "class", "outer-container svelte-up669r");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(warning, div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const warning_changes = {};

			if (dirty & /*$$scope, $_*/ 65) {
				warning_changes.$$scope = { dirty, ctx };
			}

			warning.$set(warning_changes);
		},
		i(local) {
			if (current) return;
			transition_in(warning.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(warning.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(warning);
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let $_;
	component_subscribe($$self, _, $$value => $$invalidate(0, $_ = $$value));
	const { recommendedInjectedWallets, name } = internalState$.getValue().appMetadata || {};
	return [$_, recommendedInjectedWallets, name];
}

class InstallWallet extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, {}, add_css$8);
	}
}

/* src/views/connect/WalletButton.svelte generated by Svelte v3.46.4 */

function add_css$7(target) {
	append_styles(target, "svelte-kjyo9y", "button.svelte-kjyo9y{position:relative;background-color:var(\n      --onboard-wallet-button-background,\n      var(--onboard-white, var(--white))\n    );border:1px solid\n      var(\n        --onboard-wallet-button-border-color,\n        var(--onboard-primary-200, var(--primary-200))\n      );transition:background-color 250ms ease-in-out;color:var(\n      --onboard-wallet-button-color,\n      var(--onboard-gray-700, var(--gray-700))\n    )}button.svelte-kjyo9y:hover{background-color:var(\n      --onboard-wallet-button-background-hover,\n      var(--onboard-primary-100, var(--primary-100))\n    )}button.connected.svelte-kjyo9y{border:1px solid var(--onboard-success-200, var(--success-200))}button.connected.svelte-kjyo9y:hover{background-color:var(--onboard-success-100, var(--success-100))}.name.svelte-kjyo9y{margin-left:var(--onboard-spacing-4, var(--spacing-4))}");
}

// (58:2) {#if connected}
function create_if_block$4(ctx) {
	let successstatusicon;
	let current;

	successstatusicon = new SuccessStatusIcon({
			props: { size: 16, bottom: null, right: 16 }
		});

	return {
		c() {
			create_component(successstatusicon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(successstatusicon, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(successstatusicon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(successstatusicon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(successstatusicon, detaching);
		}
	};
}

function create_fragment$7(ctx) {
	let button;
	let walletappbadge;
	let t0;
	let span;
	let t1;
	let t2;
	let button_intro;
	let current;
	let mounted;
	let dispose;

	walletappbadge = new WalletAppBadge({
			props: {
				size: 48,
				icon: /*icon*/ ctx[0],
				loading: /*connecting*/ ctx[4],
				border: /*connected*/ ctx[3] ? 'green' : 'blue',
				background: "transparent"
			}
		});

	let if_block = /*connected*/ ctx[3] && create_if_block$4();

	return {
		c() {
			button = element("button");
			create_component(walletappbadge.$$.fragment);
			t0 = space();
			span = element("span");
			t1 = text(/*label*/ ctx[1]);
			t2 = space();
			if (if_block) if_block.c();
			attr(span, "class", "name svelte-kjyo9y");
			attr(button, "class", "svelte-kjyo9y");
			toggle_class(button, "connected", /*connected*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			mount_component(walletappbadge, button, null);
			append(button, t0);
			append(button, span);
			append(span, t1);
			append(button, t2);
			if (if_block) if_block.m(button, null);
			current = true;

			if (!mounted) {
				dispose = listen(button, "click", function () {
					if (is_function(/*onClick*/ ctx[2])) /*onClick*/ ctx[2].apply(this, arguments);
				});

				mounted = true;
			}
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;
			const walletappbadge_changes = {};
			if (dirty & /*icon*/ 1) walletappbadge_changes.icon = /*icon*/ ctx[0];
			if (dirty & /*connecting*/ 16) walletappbadge_changes.loading = /*connecting*/ ctx[4];
			if (dirty & /*connected*/ 8) walletappbadge_changes.border = /*connected*/ ctx[3] ? 'green' : 'blue';
			walletappbadge.$set(walletappbadge_changes);
			if (!current || dirty & /*label*/ 2) set_data(t1, /*label*/ ctx[1]);

			if (/*connected*/ ctx[3]) {
				if (if_block) {
					if (dirty & /*connected*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$4();
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(button, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (dirty & /*connected*/ 8) {
				toggle_class(button, "connected", /*connected*/ ctx[3]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(walletappbadge.$$.fragment, local);
			transition_in(if_block);

			if (!button_intro) {
				add_render_callback(() => {
					button_intro = create_in_transition(button, fade, {});
					button_intro.start();
				});
			}

			current = true;
		},
		o(local) {
			transition_out(walletappbadge.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			destroy_component(walletappbadge);
			if (if_block) if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let { icon } = $$props;
	let { label } = $$props;
	let { onClick } = $$props;
	let { connected } = $$props;
	let { connecting } = $$props;

	$$self.$$set = $$props => {
		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
		if ('label' in $$props) $$invalidate(1, label = $$props.label);
		if ('onClick' in $$props) $$invalidate(2, onClick = $$props.onClick);
		if ('connected' in $$props) $$invalidate(3, connected = $$props.connected);
		if ('connecting' in $$props) $$invalidate(4, connecting = $$props.connecting);
	};

	return [icon, label, onClick, connected, connecting];
}

class WalletButton extends SvelteComponent {
	constructor(options) {
		super();

		init$1(
			this,
			options,
			instance$7,
			create_fragment$7,
			safe_not_equal,
			{
				icon: 0,
				label: 1,
				onClick: 2,
				connected: 3,
				connecting: 4
			},
			add_css$7
		);
	}
}

/* src/views/connect/SelectingWallet.svelte generated by Svelte v3.46.4 */

function add_css$6(target) {
	append_styles(target, "svelte-9xeusa", ".outer-container.svelte-9xeusa{display:flex;flex-direction:column;padding:var(--onboard-spacing-4, var(--spacing-4));padding-top:0}.wallets-container.svelte-9xeusa{display:grid;grid-template-columns:repeat(var(--onboard-wallet-columns, 2), 1fr);gap:var(--onboard-spacing-5, var(--spacing-5));width:100%}.warning-container.svelte-9xeusa{margin-bottom:1rem}@media all and (max-width: 520px){.wallets-container.svelte-9xeusa{grid-template-columns:repeat(1, 1fr)}}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[6] = list[i];
	return child_ctx;
}

// (41:2) {#if connectingErrorMessage}
function create_if_block$3(ctx) {
	let div;
	let warning;
	let current;

	warning = new Warning({
			props: {
				$$slots: { default: [create_default_slot$3] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			div = element("div");
			create_component(warning.$$.fragment);
			attr(div, "class", "warning-container svelte-9xeusa");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(warning, div, null);
			current = true;
		},
		p(ctx, dirty) {
			const warning_changes = {};

			if (dirty & /*$$scope, connectingErrorMessage*/ 520) {
				warning_changes.$$scope = { dirty, ctx };
			}

			warning.$set(warning_changes);
		},
		i(local) {
			if (current) return;
			transition_in(warning.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(warning.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(warning);
		}
	};
}

// (43:6) <Warning>
function create_default_slot$3(ctx) {
	let html_tag;
	let html_anchor;

	return {
		c() {
			html_tag = new HtmlTag();
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		m(target, anchor) {
			html_tag.m(/*connectingErrorMessage*/ ctx[3], target, anchor);
			insert(target, html_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*connectingErrorMessage*/ 8) html_tag.p(/*connectingErrorMessage*/ ctx[3]);
		},
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (48:4) {#each wallets as wallet}
function create_each_block(ctx) {
	let walletbutton;
	let current;

	function func() {
		return /*func*/ ctx[5](/*wallet*/ ctx[6]);
	}

	walletbutton = new WalletButton({
			props: {
				connected: /*checkConnected*/ ctx[4](/*wallet*/ ctx[6].label),
				connecting: /*connectingWalletLabel*/ ctx[2] === /*wallet*/ ctx[6].label,
				label: /*wallet*/ ctx[6].label,
				icon: /*wallet*/ ctx[6].icon,
				onClick: func
			}
		});

	return {
		c() {
			create_component(walletbutton.$$.fragment);
		},
		m(target, anchor) {
			mount_component(walletbutton, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const walletbutton_changes = {};
			if (dirty & /*wallets*/ 1) walletbutton_changes.connected = /*checkConnected*/ ctx[4](/*wallet*/ ctx[6].label);
			if (dirty & /*connectingWalletLabel, wallets*/ 5) walletbutton_changes.connecting = /*connectingWalletLabel*/ ctx[2] === /*wallet*/ ctx[6].label;
			if (dirty & /*wallets*/ 1) walletbutton_changes.label = /*wallet*/ ctx[6].label;
			if (dirty & /*wallets*/ 1) walletbutton_changes.icon = /*wallet*/ ctx[6].icon;
			if (dirty & /*selectWallet, wallets*/ 3) walletbutton_changes.onClick = func;
			walletbutton.$set(walletbutton_changes);
		},
		i(local) {
			if (current) return;
			transition_in(walletbutton.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(walletbutton.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(walletbutton, detaching);
		}
	};
}

function create_fragment$6(ctx) {
	let div1;
	let t;
	let div0;
	let current;
	let if_block = /*connectingErrorMessage*/ ctx[3] && create_if_block$3(ctx);
	let each_value = /*wallets*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div1 = element("div");
			if (if_block) if_block.c();
			t = space();
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, "class", "wallets-container svelte-9xeusa");
			attr(div1, "class", "outer-container svelte-9xeusa");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			if (if_block) if_block.m(div1, null);
			append(div1, t);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (/*connectingErrorMessage*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*connectingErrorMessage*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div1, t);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (dirty & /*checkConnected, wallets, connectingWalletLabel, selectWallet*/ 23) {
				each_value = /*wallets*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			transition_out(if_block);
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let { wallets } = $$props;
	let { selectWallet } = $$props;
	let { connectingWalletLabel } = $$props;
	let { connectingErrorMessage } = $$props;

	function checkConnected(label) {
		const { wallets } = state.get();
		return !!wallets.find(wallet => wallet.label === label);
	}

	const func = wallet => selectWallet(wallet);

	$$self.$$set = $$props => {
		if ('wallets' in $$props) $$invalidate(0, wallets = $$props.wallets);
		if ('selectWallet' in $$props) $$invalidate(1, selectWallet = $$props.selectWallet);
		if ('connectingWalletLabel' in $$props) $$invalidate(2, connectingWalletLabel = $$props.connectingWalletLabel);
		if ('connectingErrorMessage' in $$props) $$invalidate(3, connectingErrorMessage = $$props.connectingErrorMessage);
	};

	return [
		wallets,
		selectWallet,
		connectingWalletLabel,
		connectingErrorMessage,
		checkConnected,
		func
	];
}

class SelectingWallet extends SvelteComponent {
	constructor(options) {
		super();

		init$1(
			this,
			options,
			instance$6,
			create_fragment$6,
			safe_not_equal,
			{
				wallets: 0,
				selectWallet: 1,
				connectingWalletLabel: 2,
				connectingErrorMessage: 3
			},
			add_css$6
		);
	}
}

var blocknative = `
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 790.34 114.51" width="80%">
  <defs>
    <style>.cls-1{fill:#262a3d;}.cls-2{fill:url(#linear-gradient);}.cls-3{fill:url(#linear-gradient-2);}</style>
    <linearGradient id="linear-gradient" x1="694.45" y1="46.08" x2="741.39" y2="46.08" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#55ccfe"/><stop offset="1" stop-color="#5e93ef"/>
    </linearGradient>
    <linearGradient id="linear-gradient-2" x1="694.45" y1="86.73" x2="788.33" y2="86.73" xlink:href="#linear-gradient"/>
  </defs>
  <polygon class="cls-1" points="710.09 86.73 694.45 59.63 725.74 59.63 725.74 59.63 741.39 86.73 710.09 86.73"/>
  <polygon class="cls-2" points="725.74 59.63 694.45 59.63 710.09 32.53 741.39 32.53 725.74 59.63"/>
  <polygon class="cls-1" points="757.03 59.63 741.39 32.53 710.09 32.53 694.45 5.43 757.03 5.43 788.33 59.63 757.03 59.63"/>
  <polygon class="cls-3" points="757.03 113.83 694.45 113.83 710.09 86.73 741.39 86.73 757.03 59.63 788.33 59.63 757.03 113.83"/>
  <path class="cls-1" d="M70.51,65.77c0,19.47-14.37,34.5-31.88,34.5-9.54,0-16.47-3.53-21.17-9.54v7.71H.6V6.87L17.46,1.68V40.82c4.7-6,11.63-9.54,21.17-9.54C56.14,31.28,70.51,46.3,70.51,65.77Zm-16.86,0c0-11-7.7-18.42-18.16-18.42s-18,7.45-18,18.42,7.71,18.43,18,18.43S53.65,76.75,53.65,65.77Z"/>
  <path class="cls-1" d="M78.09,6.87,94.94,1.68V98.44H78.09Z"/><path class="cls-1" d="M102.39,65.77a34.56,34.56,0,1,1,34.49,34.5A34.13,34.13,0,0,1,102.39,65.77Zm52.26,0c0-10.58-7.71-18-17.77-18s-17.64,7.45-17.64,18,7.71,18,17.64,18S154.65,76.36,154.65,65.77Z"/>
  <path class="cls-1" d="M177.9,65.77c0-19.47,14.63-34.49,34.49-34.49,12.81,0,23.91,6.79,29.27,16.85l-14.5,8.5c-2.62-5.36-8.24-8.76-14.9-8.76-10.06,0-17.51,7.45-17.51,17.9s7.45,17.77,17.51,17.77c6.8,0,12.41-3.26,15-8.62l14.63,8.36a33.47,33.47,0,0,1-29.53,17C192.53,100.27,177.9,85.24,177.9,65.77Z"/>
  <path class="cls-1" d="M290.32,98.44,266.54,68.78V98.44H249.68V6.87l16.86-5.19V61.85L289,33.11h20.12L282.87,65.38l27.05,33.06Z"/>
  <path class="cls-1" d="M377.26,58.32V98.44H360.4v-38c0-8.89-5.35-13.46-12.93-13.46-8.23,0-14.38,4.83-14.38,16.2V98.44H316.24V33.11h16.85v7.31c3.92-5.88,10.72-9.14,19.47-9.14C366.41,31.28,377.26,41,377.26,58.32Z"/>
  <path class="cls-1" d="M454.72,33.11V98.44H437.87V90.73c-4.71,5.88-11.76,9.54-21.3,9.54-17.38,0-31.75-15-31.75-34.5s14.37-34.49,31.75-34.49c9.54,0,16.59,3.66,21.3,9.54V33.11ZM437.87,65.77c0-11-7.71-18.42-18.17-18.42s-18,7.45-18,18.42,7.71,18.43,18,18.43S437.87,76.75,437.87,65.77Z"/>
  <path class="cls-1" d="M498.65,49.31V33.11H483.88V13.9L467,19.09v57.4c0,17.64,8,24.56,31.63,22V83.15c-9.67.53-14.77.39-14.77-6.66V49.31Z"/><path class="cls-1" d="M510.46,33.11h16.85V98.44H510.46Z"/>
  <path class="cls-1" d="M603.13,33.11,578.3,98.44H559.09L534.27,33.11h18.55l15.81,45.73,15.94-45.73Z"/><path class="cls-1" d="M639.2,85c6.53,0,11.76-2.74,14.64-6.53l13.58,7.84c-6.14,8.88-15.94,14-28.48,14-22,0-35.8-15-35.8-34.5s14-34.49,34.49-34.49c19.34,0,33.06,15.29,33.06,34.49A39.11,39.11,0,0,1,670,72.7H620.78C623.13,81.32,630.32,85,639.2,85Zm14.64-25.35c-2.1-9.41-9.15-13.2-16.21-13.2-9,0-15.15,4.84-17.12,13.2Z"/>
</svg>
`;

/* src/views/connect/Sidebar.svelte generated by Svelte v3.46.4 */

function add_css$5(target) {
	append_styles(target, "svelte-f9sn92", ".sidebar.svelte-f9sn92{padding:var(--onboard-spacing-3, var(--spacing-3));border-radius:24px 0 0 24px;background:var(\n      --onboard-connect-sidebar-background,\n      var(--onboard-gray-100, var(--gray-100))\n    );color:var(\n      --onboard-connect-sidebar-color,\n      var(--onboard-gray-700, var(--gray-700))\n    )}.inner-container.svelte-f9sn92{padding-left:var(--onboard-spacing-5, var(--spacing-5));max-width:236px}.icon-container.svelte-f9sn92{height:3rem;display:flex;margin-bottom:var(--onboard-spacing-4, var(--spacing-4))}.heading.svelte-f9sn92{font-size:var(--onboard-font-size-3, var(--font-size-3));margin:0 0 var(--onboard-spacing-5, var(--spacing-5)) 0}.subheading.svelte-f9sn92{margin:0 0 var(--onboard-spacing-5, var(--spacing-5)) 0}.description.svelte-f9sn92{line-height:20px;font-size:var(--onboard-font-size-6, var(--font-size-6));margin:0}.indicators.svelte-f9sn92{display:flex;align-items:center;margin-top:var(--onboard-spacing-2, var(--spacing-2))}.indicator.svelte-f9sn92{position:relative;width:8px;height:8px;border-radius:8px;background:var(\n      --onboard-connect-sidebar-progress-background,\n      var(--onboard-gray-200, var(--gray-200))\n    );transition:background 250ms ease-in-out}.indicator.on.svelte-f9sn92{background:var(\n      --onboard-connect-sidebar-progress-color,\n      var(--onboard-primary-600, var(--primary-600))\n    );border:2px solid\n      var(\n        --onboard-connect-sidebar-progress-background,\n        var(--onboard-gray-200, var(--gray-200))\n      )}.join.svelte-f9sn92{position:relative;z-index:1;right:4px;height:2px;background:var(\n      --onboard-connect-sidebar-progress-background,\n      var(--onboard-gray-200, var(--gray-200))\n    );transition:background 250ms ease-in-out}.join.active.svelte-f9sn92{background:var(\n      --onboard-connect-sidebar-progress-color,\n      var(--onboard-primary-600, var(--primary-600))\n    )}img.svelte-f9sn92{max-width:100%;height:auto}");
}

// (118:6) {:else}
function create_else_block_1(ctx) {
	let html_tag;
	let html_anchor;

	return {
		c() {
			html_tag = new HtmlTag();
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		m(target, anchor) {
			html_tag.m(blocknative, target, anchor);
			insert(target, html_anchor, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (112:6) {#if logo || icon}
function create_if_block_1$2(ctx) {
	let if_block_anchor;

	function select_block_type_1(ctx, dirty) {
		if (isSVG(/*logo*/ ctx[3] || /*icon*/ ctx[2])) return create_if_block_2$2;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if_block.p(ctx, dirty);
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (115:8) {:else}
function create_else_block(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			if (!src_url_equal(img.src, img_src_value = /*logo*/ ctx[3] || /*icon*/ ctx[2])) attr(img, "src", img_src_value);
			attr(img, "alt", "logo");
			attr(img, "class", "svelte-f9sn92");
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (113:8) {#if isSVG(logo || icon)}
function create_if_block_2$2(ctx) {
	let html_tag;
	let raw_value = (/*logo*/ ctx[3] || /*icon*/ ctx[2]) + "";
	let html_anchor;

	return {
		c() {
			html_tag = new HtmlTag();
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		m(target, anchor) {
			html_tag.m(raw_value, target, anchor);
			insert(target, html_anchor, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (122:4) {#if $_(`connect.${step}.sidebar.heading`, { default: '' })}
function create_if_block$2(ctx) {
	let h2;
	let t_value = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.heading`, { default: /*heading*/ ctx[7] }) + "";
	let t;

	return {
		c() {
			h2 = element("h2");
			t = text(t_value);
			attr(h2, "class", "heading svelte-f9sn92");
		},
		m(target, anchor) {
			insert(target, h2, anchor);
			append(h2, t);
		},
		p(ctx, dirty) {
			if (dirty & /*$_, step*/ 3 && t_value !== (t_value = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.heading`, { default: /*heading*/ ctx[7] }) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(h2);
		}
	};
}

function create_fragment$5(ctx) {
	let div8;
	let div7;
	let div0;
	let t0;
	let show_if = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.heading`, { default: '' });
	let t1;
	let h4;
	let t2_value = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.subheading`, { default: /*subheading*/ ctx[5] }) + "";
	let t2;
	let t3;
	let p;

	let t4_value = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.paragraph`, {
		values: { app: /*name*/ ctx[4] },
		default: /*paragraph*/ ctx[6]
	}) + "";

	let t4;
	let t5;
	let div6;
	let div1;
	let t6;
	let div2;
	let div2_style_value;
	let t7;
	let div3;
	let t8;
	let div4;
	let div4_style_value;
	let t9;
	let div5;

	function select_block_type(ctx, dirty) {
		if (/*logo*/ ctx[3] || /*icon*/ ctx[2]) return create_if_block_1$2;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = show_if && create_if_block$2(ctx);

	return {
		c() {
			div8 = element("div");
			div7 = element("div");
			div0 = element("div");
			if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			h4 = element("h4");
			t2 = text(t2_value);
			t3 = space();
			p = element("p");
			t4 = text(t4_value);
			t5 = space();
			div6 = element("div");
			div1 = element("div");
			t6 = space();
			div2 = element("div");
			t7 = space();
			div3 = element("div");
			t8 = space();
			div4 = element("div");
			t9 = space();
			div5 = element("div");
			attr(div0, "class", "icon-container svelte-f9sn92");
			attr(h4, "class", "subheading svelte-f9sn92");
			attr(p, "class", "description svelte-f9sn92");
			attr(div1, "class", "indicator svelte-f9sn92");
			toggle_class(div1, "on", true);
			attr(div2, "class", "join svelte-f9sn92");

			attr(div2, "style", div2_style_value = `${/*step*/ ctx[0] !== 'selectingWallet'
			? 'right: 4px; width: 52px;'
			: 'right: 2px; width: 54px;'}`);

			toggle_class(div2, "active", /*step*/ ctx[0] !== 'selectingWallet');
			attr(div3, "class", "indicator svelte-f9sn92");
			attr(div3, "style", `right: 8px;`);
			toggle_class(div3, "on", /*step*/ ctx[0] !== 'selectingWallet');
			attr(div4, "class", "join svelte-f9sn92");

			attr(div4, "style", div4_style_value = `${/*step*/ ctx[0] === 'connectedWallet'
			? 'right: 12px; width: 52px;'
			: 'right: 10px; width: 54px;'}`);

			toggle_class(div4, "active", /*step*/ ctx[0] === 'connectedWallet');
			attr(div5, "style", `right: 16px;`);
			attr(div5, "class", "indicator svelte-f9sn92");
			toggle_class(div5, "on", /*step*/ ctx[0] === 'connectedWallet');
			attr(div6, "class", "indicators svelte-f9sn92");
			attr(div7, "class", "inner-container svelte-f9sn92");
			attr(div8, "class", "sidebar svelte-f9sn92");
		},
		m(target, anchor) {
			insert(target, div8, anchor);
			append(div8, div7);
			append(div7, div0);
			if_block0.m(div0, null);
			append(div7, t0);
			if (if_block1) if_block1.m(div7, null);
			append(div7, t1);
			append(div7, h4);
			append(h4, t2);
			append(div7, t3);
			append(div7, p);
			append(p, t4);
			append(div7, t5);
			append(div7, div6);
			append(div6, div1);
			append(div6, t6);
			append(div6, div2);
			append(div6, t7);
			append(div6, div3);
			append(div6, t8);
			append(div6, div4);
			append(div6, t9);
			append(div6, div5);
		},
		p(ctx, [dirty]) {
			if_block0.p(ctx, dirty);
			if (dirty & /*$_, step*/ 3) show_if = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.heading`, { default: '' });

			if (show_if) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block$2(ctx);
					if_block1.c();
					if_block1.m(div7, t1);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*$_, step*/ 3 && t2_value !== (t2_value = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.subheading`, { default: /*subheading*/ ctx[5] }) + "")) set_data(t2, t2_value);

			if (dirty & /*$_, step*/ 3 && t4_value !== (t4_value = /*$_*/ ctx[1](`connect.${/*step*/ ctx[0]}.sidebar.paragraph`, {
				values: { app: /*name*/ ctx[4] },
				default: /*paragraph*/ ctx[6]
			}) + "")) set_data(t4, t4_value);

			if (dirty & /*step*/ 1 && div2_style_value !== (div2_style_value = `${/*step*/ ctx[0] !== 'selectingWallet'
			? 'right: 4px; width: 52px;'
			: 'right: 2px; width: 54px;'}`)) {
				attr(div2, "style", div2_style_value);
			}

			if (dirty & /*step*/ 1) {
				toggle_class(div2, "active", /*step*/ ctx[0] !== 'selectingWallet');
			}

			if (dirty & /*step*/ 1) {
				toggle_class(div3, "on", /*step*/ ctx[0] !== 'selectingWallet');
			}

			if (dirty & /*step*/ 1 && div4_style_value !== (div4_style_value = `${/*step*/ ctx[0] === 'connectedWallet'
			? 'right: 12px; width: 52px;'
			: 'right: 10px; width: 54px;'}`)) {
				attr(div4, "style", div4_style_value);
			}

			if (dirty & /*step*/ 1) {
				toggle_class(div4, "active", /*step*/ ctx[0] === 'connectedWallet');
			}

			if (dirty & /*step*/ 1) {
				toggle_class(div5, "on", /*step*/ ctx[0] === 'connectedWallet');
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div8);
			if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let $_;
	component_subscribe($$self, _, $$value => $$invalidate(1, $_ = $$value));
	let { step } = $$props;
	const { appMetadata } = internalState$.getValue();
	const { icon, logo, name = 'This app' } = appMetadata || {};
	const defaultContent = en.connect[step].sidebar;
	const { subheading, paragraph } = defaultContent;
	const { heading } = defaultContent;

	$$self.$$set = $$props => {
		if ('step' in $$props) $$invalidate(0, step = $$props.step);
	};

	return [step, $_, icon, logo, name, subheading, paragraph, heading];
}

class Sidebar extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, { step: 0 }, add_css$5);
	}
}

/* src/views/connect/Index.svelte generated by Svelte v3.46.4 */

function add_css$4(target) {
	append_styles(target, "svelte-37ahne", ".container.svelte-37ahne{position:relative;display:flex;font-family:var(--onboard-font-family-normal, var(--font-family-normal));line-height:24px;color:var(--onboard-gray-700, var(--gray-700));font-size:var(--onboard-font-size-5, var(--font-size-5));height:var(--onboard-connect-content-height, 440px);overflow:hidden}.content.svelte-37ahne{width:var(--onboard-connect-content-width, 488px);display:flex;flex-direction:column}.scroll-container.svelte-37ahne{overflow-y:auto;transition:opacity 250ms ease-in-out;scrollbar-width:none}.scroll-container.svelte-37ahne::-webkit-scrollbar{display:none}.header.svelte-37ahne{position:relative;display:flex;align-items:center;box-shadow:var(--onboard-shadow-2, var(--shadow-2));background-color:var(\n      --onboard-connect-header-background,\n      var(--onboard-white, var(--white))\n    );color:var(\n      --onboard-connect-header-color,\n      var(--onboard-black, var(--black))\n    );border-radius:0 24px 0 0}.header-heading.svelte-37ahne{margin:var(--onboard-spacing-4, var(--spacing-4));line-height:16px}.button-container.svelte-37ahne{position:absolute;right:var(--onboard-spacing-5, var(--spacing-5));top:var(--onboard-spacing-5, var(--spacing-5))}.disabled.svelte-37ahne{opacity:0.2;pointer-events:none}@media all and (max-width: 520px){.content.svelte-37ahne{width:100%}.container.svelte-37ahne{height:auto;min-height:228px}}");
}

// (273:0) {#if !autoSelect || (autoSelect && !autoSelect.disableModals)}
function create_if_block$1(ctx) {
	let modal;
	let current;

	modal = new Modal({
			props: {
				close: /*close*/ ctx[13],
				$$slots: { default: [create_default_slot$2] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(modal.$$.fragment);
		},
		m(target, anchor) {
			mount_component(modal, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const modal_changes = {};

			if (dirty & /*$$scope, scrollContainer, selectedWallet, step, connectionRejected, agreed, wallets, connectingWalletLabel, connectingErrorMessage, autoSelect, $_, windowWidth*/ 134219775) {
				modal_changes.$$scope = { dirty, ctx };
			}

			modal.$set(modal_changes);
		},
		i(local) {
			if (current) return;
			transition_in(modal.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(modal.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(modal, detaching);
		}
	};
}

// (276:6) {#if windowWidth >= 809}
function create_if_block_6(ctx) {
	let sidebar;
	let current;
	sidebar = new Sidebar({ props: { step: /*step*/ ctx[1] } });

	return {
		c() {
			create_component(sidebar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(sidebar, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const sidebar_changes = {};
			if (dirty & /*step*/ 2) sidebar_changes.step = /*step*/ ctx[1];
			sidebar.$set(sidebar_changes);
		},
		i(local) {
			if (current) return;
			transition_in(sidebar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(sidebar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(sidebar, detaching);
		}
	};
}

// (297:10) {#if step === 'selectingWallet'}
function create_if_block_3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_4, create_if_block_5];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*wallets*/ ctx[3].length) return 0;
		if (!/*autoSelect*/ ctx[0]) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach(if_block_anchor);
		}
	};
}

// (309:34) 
function create_if_block_5(ctx) {
	let installwallet;
	let current;
	installwallet = new InstallWallet({});

	return {
		c() {
			create_component(installwallet.$$.fragment);
		},
		m(target, anchor) {
			mount_component(installwallet, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(installwallet.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(installwallet.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(installwallet, detaching);
		}
	};
}

// (298:12) {#if wallets.length}
function create_if_block_4(ctx) {
	let agreement;
	let updating_agreed;
	let t;
	let div;
	let selectingwallet;
	let current;

	function agreement_agreed_binding(value) {
		/*agreement_agreed_binding*/ ctx[17](value);
	}

	let agreement_props = {};

	if (/*agreed*/ ctx[5] !== void 0) {
		agreement_props.agreed = /*agreed*/ ctx[5];
	}

	agreement = new Agreement({ props: agreement_props });
	binding_callbacks.push(() => bind(agreement, 'agreed', agreement_agreed_binding));

	selectingwallet = new SelectingWallet({
			props: {
				selectWallet: /*selectWallet*/ ctx[11],
				wallets: /*wallets*/ ctx[3],
				connectingWalletLabel: /*connectingWalletLabel*/ ctx[6],
				connectingErrorMessage: /*connectingErrorMessage*/ ctx[7]
			}
		});

	return {
		c() {
			create_component(agreement.$$.fragment);
			t = space();
			div = element("div");
			create_component(selectingwallet.$$.fragment);
			attr(div, "class", "svelte-37ahne");
			toggle_class(div, "disabled", !/*agreed*/ ctx[5]);
		},
		m(target, anchor) {
			mount_component(agreement, target, anchor);
			insert(target, t, anchor);
			insert(target, div, anchor);
			mount_component(selectingwallet, div, null);
			current = true;
		},
		p(ctx, dirty) {
			const agreement_changes = {};

			if (!updating_agreed && dirty & /*agreed*/ 32) {
				updating_agreed = true;
				agreement_changes.agreed = /*agreed*/ ctx[5];
				add_flush_callback(() => updating_agreed = false);
			}

			agreement.$set(agreement_changes);
			const selectingwallet_changes = {};
			if (dirty & /*wallets*/ 8) selectingwallet_changes.wallets = /*wallets*/ ctx[3];
			if (dirty & /*connectingWalletLabel*/ 64) selectingwallet_changes.connectingWalletLabel = /*connectingWalletLabel*/ ctx[6];
			if (dirty & /*connectingErrorMessage*/ 128) selectingwallet_changes.connectingErrorMessage = /*connectingErrorMessage*/ ctx[7];
			selectingwallet.$set(selectingwallet_changes);

			if (dirty & /*agreed*/ 32) {
				toggle_class(div, "disabled", !/*agreed*/ ctx[5]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(agreement.$$.fragment, local);
			transition_in(selectingwallet.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(agreement.$$.fragment, local);
			transition_out(selectingwallet.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(agreement, detaching);
			if (detaching) detach(t);
			if (detaching) detach(div);
			destroy_component(selectingwallet);
		}
	};
}

// (314:10) {#if step === 'connectingWallet' && selectedWallet}
function create_if_block_2$1(ctx) {
	let connectingwallet;
	let current;

	connectingwallet = new ConnectingWallet({
			props: {
				connectWallet: /*connectWallet*/ ctx[14],
				connectionRejected: /*connectionRejected*/ ctx[2],
				setStep: /*setStep*/ ctx[15],
				deselectWallet: /*deselectWallet*/ ctx[12],
				selectedWallet: /*selectedWallet*/ ctx[4]
			}
		});

	return {
		c() {
			create_component(connectingwallet.$$.fragment);
		},
		m(target, anchor) {
			mount_component(connectingwallet, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const connectingwallet_changes = {};
			if (dirty & /*connectionRejected*/ 4) connectingwallet_changes.connectionRejected = /*connectionRejected*/ ctx[2];
			if (dirty & /*selectedWallet*/ 16) connectingwallet_changes.selectedWallet = /*selectedWallet*/ ctx[4];
			connectingwallet.$set(connectingwallet_changes);
		},
		i(local) {
			if (current) return;
			transition_in(connectingwallet.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(connectingwallet.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(connectingwallet, detaching);
		}
	};
}

// (324:10) {#if step === 'connectedWallet' && selectedWallet}
function create_if_block_1$1(ctx) {
	let connectedwallet;
	let current;

	connectedwallet = new ConnectedWallet({
			props: {
				selectedWallet: /*selectedWallet*/ ctx[4]
			}
		});

	return {
		c() {
			create_component(connectedwallet.$$.fragment);
		},
		m(target, anchor) {
			mount_component(connectedwallet, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const connectedwallet_changes = {};
			if (dirty & /*selectedWallet*/ 16) connectedwallet_changes.selectedWallet = /*selectedWallet*/ ctx[4];
			connectedwallet.$set(connectedwallet_changes);
		},
		i(local) {
			if (current) return;
			transition_in(connectedwallet.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(connectedwallet.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(connectedwallet, detaching);
		}
	};
}

// (274:2) <Modal {close}>
function create_default_slot$2(ctx) {
	let div4;
	let t0;
	let div3;
	let div1;
	let h4;

	let t1_value = /*$_*/ ctx[10](`connect.${/*step*/ ctx[1]}.header`, {
		default: en.connect[/*step*/ ctx[1]].header,
		values: {
			connectionRejected: /*connectionRejected*/ ctx[2],
			wallet: /*selectedWallet*/ ctx[4] && /*selectedWallet*/ ctx[4].label
		}
	}) + "";

	let t1;
	let t2;
	let div0;
	let closebutton;
	let t3;
	let div2;
	let t4;
	let t5;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*windowWidth*/ ctx[8] >= 809 && create_if_block_6(ctx);
	closebutton = new CloseButton({});
	let if_block1 = /*step*/ ctx[1] === 'selectingWallet' && create_if_block_3(ctx);
	let if_block2 = /*step*/ ctx[1] === 'connectingWallet' && /*selectedWallet*/ ctx[4] && create_if_block_2$1(ctx);
	let if_block3 = /*step*/ ctx[1] === 'connectedWallet' && /*selectedWallet*/ ctx[4] && create_if_block_1$1(ctx);

	return {
		c() {
			div4 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div3 = element("div");
			div1 = element("div");
			h4 = element("h4");
			t1 = text(t1_value);
			t2 = space();
			div0 = element("div");
			create_component(closebutton.$$.fragment);
			t3 = space();
			div2 = element("div");
			if (if_block1) if_block1.c();
			t4 = space();
			if (if_block2) if_block2.c();
			t5 = space();
			if (if_block3) if_block3.c();
			attr(h4, "class", "header-heading svelte-37ahne");
			attr(div0, "class", "button-container svelte-37ahne");
			attr(div1, "class", "header svelte-37ahne");
			attr(div2, "class", "scroll-container svelte-37ahne");
			attr(div3, "class", "content svelte-37ahne");
			attr(div4, "class", "container svelte-37ahne");
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			if (if_block0) if_block0.m(div4, null);
			append(div4, t0);
			append(div4, div3);
			append(div3, div1);
			append(div1, h4);
			append(h4, t1);
			append(div1, t2);
			append(div1, div0);
			mount_component(closebutton, div0, null);
			append(div3, t3);
			append(div3, div2);
			if (if_block1) if_block1.m(div2, null);
			append(div2, t4);
			if (if_block2) if_block2.m(div2, null);
			append(div2, t5);
			if (if_block3) if_block3.m(div2, null);
			/*div2_binding*/ ctx[18](div2);
			current = true;

			if (!mounted) {
				dispose = listen(div0, "click", /*close*/ ctx[13]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*windowWidth*/ ctx[8] >= 809) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*windowWidth*/ 256) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_6(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div4, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if ((!current || dirty & /*$_, step, connectionRejected, selectedWallet*/ 1046) && t1_value !== (t1_value = /*$_*/ ctx[10](`connect.${/*step*/ ctx[1]}.header`, {
				default: en.connect[/*step*/ ctx[1]].header,
				values: {
					connectionRejected: /*connectionRejected*/ ctx[2],
					wallet: /*selectedWallet*/ ctx[4] && /*selectedWallet*/ ctx[4].label
				}
			}) + "")) set_data(t1, t1_value);

			if (/*step*/ ctx[1] === 'selectingWallet') {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*step*/ 2) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_3(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div2, t4);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (/*step*/ ctx[1] === 'connectingWallet' && /*selectedWallet*/ ctx[4]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);

					if (dirty & /*step, selectedWallet*/ 18) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block_2$1(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(div2, t5);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			if (/*step*/ ctx[1] === 'connectedWallet' && /*selectedWallet*/ ctx[4]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);

					if (dirty & /*step, selectedWallet*/ 18) {
						transition_in(if_block3, 1);
					}
				} else {
					if_block3 = create_if_block_1$1(ctx);
					if_block3.c();
					transition_in(if_block3, 1);
					if_block3.m(div2, null);
				}
			} else if (if_block3) {
				group_outros();

				transition_out(if_block3, 1, 1, () => {
					if_block3 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(closebutton.$$.fragment, local);
			transition_in(if_block1);
			transition_in(if_block2);
			transition_in(if_block3);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(closebutton.$$.fragment, local);
			transition_out(if_block1);
			transition_out(if_block2);
			transition_out(if_block3);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div4);
			if (if_block0) if_block0.d();
			destroy_component(closebutton);
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			/*div2_binding*/ ctx[18](null);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$4(ctx) {
	let if_block_anchor;
	let current;
	let mounted;
	let dispose;
	add_render_callback(/*onwindowresize*/ ctx[16]);
	let if_block = (!/*autoSelect*/ ctx[0] || /*autoSelect*/ ctx[0] && !/*autoSelect*/ ctx[0].disableModals) && create_if_block$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = listen(window, "resize", /*onwindowresize*/ ctx[16]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (!/*autoSelect*/ ctx[0] || /*autoSelect*/ ctx[0] && !/*autoSelect*/ ctx[0].disableModals) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*autoSelect*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
			mounted = false;
			dispose();
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let $_;
	component_subscribe($$self, _, $$value => $$invalidate(10, $_ = $$value));
	let { autoSelect } = $$props;
	const { walletModules, appMetadata } = internalState$.getValue();
	let connectionRejected = false;
	let wallets = [];
	let selectedWallet;
	let agreed;
	let connectingWalletLabel;
	let connectingErrorMessage;
	let windowWidth;
	let scrollContainer;
	const walletToAutoSelect = autoSelect && walletModules.find(({ label }) => label.toLowerCase() === autoSelect.label.toLowerCase());

	// ==== SELECT WALLET ==== //
	async function selectWallet({ label, icon, getInterface }) {
		$$invalidate(6, connectingWalletLabel = label);

		try {
			const existingWallet = state.get().wallets.find(wallet => wallet.label === label);

			if (existingWallet) {
				// set as first wallet
				addWallet(existingWallet);

				try {
					await selectAccounts(existingWallet.provider);

					// change step on next event loop
					setTimeout(() => setStep('connectedWallet'), 1);
				} catch(error) {
					const { code } = error;

					if (code === ProviderRpcErrorCode.UNSUPPORTED_METHOD || code === ProviderRpcErrorCode.DOES_NOT_EXIST) {
						connectWallet$.next({
							inProgress: false,
							actionRequired: existingWallet.label
						});
					}
				}

				$$invalidate(4, selectedWallet = existingWallet);
				return;
			}

			const { chains } = state.get();

			const { provider, instance } = await getInterface({
				chains,
				BigNumber,
				EventEmitter,
				appMetadata
			});

			const loadedIcon = await icon;

			$$invalidate(4, selectedWallet = {
				label,
				icon: loadedIcon,
				provider,
				instance,
				accounts: [],
				chains: [{ namespace: 'evm', id: '0x1' }]
			});

			$$invalidate(7, connectingErrorMessage = '');

			// change step on next event loop
			setTimeout(() => setStep('connectingWallet'), 1);
		} catch(error) {
			const { message } = error;
			$$invalidate(7, connectingErrorMessage = message);
			scrollToTop();
		} finally {
			$$invalidate(6, connectingWalletLabel = '');
		}
	}

	function deselectWallet() {
		$$invalidate(4, selectedWallet = null);
	}

	function updateSelectedWallet(update) {
		$$invalidate(4, selectedWallet = { ...selectedWallet, ...update });
	}

	async function autoSelectWallet(wallet) {
		const { getIcon, getInterface, label } = wallet;
		const icon = getIcon();
		selectWallet({ label, icon, getInterface });
	}

	async function loadWalletsForSelection() {
		$$invalidate(3, wallets = walletModules.map(({ getIcon, getInterface, label }) => {
			return { label, icon: getIcon(), getInterface };
		}));
	}

	function close() {
		connectWallet$.next({ inProgress: false });
	}

	// ==== CONNECT WALLET ==== //
	async function connectWallet() {
		$$invalidate(2, connectionRejected = false);
		const { provider, label } = selectedWallet;
    const { ethereum } = window

    const selectMetaMask = ethereum && ethereum.providers?.length > 1 && label === 'MetaMask'
      if (selectMetaMask) { 
        const selectProvider = ethereum.providers.find((provider) => provider.isMetaMask)
        provider.selectedProvider = selectProvider
        ethereum.selectedProvider = selectProvider
      }

		try {
			const [address] = await requestAccounts(selectMetaMask ? provider.selectedProvider : provider);

			// canceled previous request
			if (!address) {
				return;
			}

			const chain = await getChainId(provider);

			const update = {
				accounts: [{ address, ens: null, balance: null }],
				chains: [{ namespace: 'evm', id: chain }]
			};

			addWallet({ ...selectedWallet, ...update });
			trackWallet(provider, label);
			updateSelectedWallet(update);
			setStep('connectedWallet');
		} catch(error) {
			const { code } = error;

			// user rejected account access
			if (code === ProviderRpcErrorCode.ACCOUNT_ACCESS_REJECTED) {
				$$invalidate(2, connectionRejected = true);
				return;
			}

			// account access has already been requested and is awaiting approval
			if (code === ProviderRpcErrorCode.ACCOUNT_ACCESS_ALREADY_REQUESTED) {
				return;
			}
		}
	}

	// ==== CONNECTED WALLET ==== //
	async function updateAccountDetails() {
		const { accounts, chains: selectedWalletChains } = selectedWallet;
		const appChains = state.get().chains;
		const [connectedWalletChain] = selectedWalletChains;
		const appChain = appChains.find(({ namespace, id }) => namespace === connectedWalletChain.namespace && id === connectedWalletChain.id);
		const { address } = accounts[0];
		let { balance, ens } = accounts[0];

		if (balance === null) {
			getBalance(address, appChain).then(balance => {
				updateAccount(selectedWallet.label, address, { balance });
			});
		}

		if (ens === null && validEnsChain(connectedWalletChain.id)) {
			getEns(address, appChain).then(ens => {
				updateAccount(selectedWallet.label, address, { ens });
			});
		}

		setTimeout(() => connectWallet$.next({ inProgress: false }), 1500);
	}

	let step = 'selectingWallet';

	function setStep(update) {
		$$invalidate(1, step = update);
	}

	function scrollToTop() {
		scrollContainer && scrollContainer.scrollTo(0, 0);
	}

	function onwindowresize() {
		$$invalidate(8, windowWidth = window.innerWidth);
	}

	function agreement_agreed_binding(value) {
		agreed = value;
		$$invalidate(5, agreed);
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			scrollContainer = $$value;
			$$invalidate(9, scrollContainer);
		});
	}

	$$self.$$set = $$props => {
		if ('autoSelect' in $$props) $$invalidate(0, autoSelect = $$props.autoSelect);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*step*/ 2) {
			// ==== STEP HANDLING LOGIC ==== //
			switch (step) {
				case 'selectingWallet':
					{
						if (walletToAutoSelect) {
							autoSelectWallet(walletToAutoSelect);
						} else {
							loadWalletsForSelection();
						}

						break;
					}
				case 'connectingWallet':
					{
						connectWallet();
						break;
					}
				case 'connectedWallet':
					{
						updateAccountDetails();
						break;
					}
			}
		}
	};

	return [
		autoSelect,
		step,
		connectionRejected,
		wallets,
		selectedWallet,
		agreed,
		connectingWalletLabel,
		connectingErrorMessage,
		windowWidth,
		scrollContainer,
		$_,
		selectWallet,
		deselectWallet,
		close,
		connectWallet,
		setStep,
		onwindowresize,
		agreement_agreed_binding,
		div2_binding
	];
}

class Index$1 extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, { autoSelect: 0 }, add_css$4);
	}
}

/* src/views/chain/SwitchChain.svelte generated by Svelte v3.46.4 */

function add_css$3(target) {
	append_styles(target, "svelte-gp520o", ".container.svelte-gp520o{position:relative;padding:var(--onboard-spacing-4, var(--spacing-4));font-family:var(--onboard-font-family-normal, var(--font-family-normal));line-height:16px;font-size:var(--onboard-font-size-5, var(--font-size-5))}.close.svelte-gp520o{position:absolute;top:var(--onboard-spacing-5, var(--spacing-5));right:var(--onboard-spacing-5, var(--spacing-5));padding:0.5rem}h4.svelte-gp520o{font-size:var(--onboard-font-size-3, var(--font-size-3));margin:var(--onboard-spacing-4, var(--spacing-4)) 0}p.svelte-gp520o{margin:0 0 var(--onboard-spacing-4, var(--spacing-4)) 0;max-width:488px}");
}

// (43:0) <Modal {close}>
function create_default_slot$1(ctx) {
	let div1;
	let h4;
	let t0_value = /*$_*/ ctx[0]('modals.switchChain.heading', { default: en.modals.switchChain.heading }) + "";
	let t0;
	let t1;
	let p0;

	let t2_value = /*$_*/ ctx[0]('modals.switchChain.paragraph1', {
		default: en.modals.switchChain.paragraph1,
		values: {
			app: /*appMetadata*/ ctx[1] && /*appMetadata*/ ctx[1].name || 'This app',
			nextNetworkName: /*nextNetworkName*/ ctx[2]
		}
	}) + "";

	let t2;
	let t3;
	let p1;

	let t4_value = /*$_*/ ctx[0]('modals.switchChain.paragraph2', {
		default: en.modals.switchChain.paragraph2
	}) + "";

	let t4;
	let t5;
	let div0;
	let closebutton;
	let current;
	let mounted;
	let dispose;
	closebutton = new CloseButton({});

	return {
		c() {
			div1 = element("div");
			h4 = element("h4");
			t0 = text(t0_value);
			t1 = space();
			p0 = element("p");
			t2 = text(t2_value);
			t3 = space();
			p1 = element("p");
			t4 = text(t4_value);
			t5 = space();
			div0 = element("div");
			create_component(closebutton.$$.fragment);
			attr(h4, "class", "svelte-gp520o");
			attr(p0, "class", "svelte-gp520o");
			attr(p1, "class", "svelte-gp520o");
			attr(div0, "class", "close svelte-gp520o");
			attr(div1, "class", "container svelte-gp520o");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, h4);
			append(h4, t0);
			append(div1, t1);
			append(div1, p0);
			append(p0, t2);
			append(div1, t3);
			append(div1, p1);
			append(p1, t4);
			append(div1, t5);
			append(div1, div0);
			mount_component(closebutton, div0, null);
			current = true;

			if (!mounted) {
				dispose = listen(div0, "click", /*close*/ ctx[3]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if ((!current || dirty & /*$_*/ 1) && t0_value !== (t0_value = /*$_*/ ctx[0]('modals.switchChain.heading', { default: en.modals.switchChain.heading }) + "")) set_data(t0, t0_value);

			if ((!current || dirty & /*$_*/ 1) && t2_value !== (t2_value = /*$_*/ ctx[0]('modals.switchChain.paragraph1', {
				default: en.modals.switchChain.paragraph1,
				values: {
					app: /*appMetadata*/ ctx[1] && /*appMetadata*/ ctx[1].name || 'This app',
					nextNetworkName: /*nextNetworkName*/ ctx[2]
				}
			}) + "")) set_data(t2, t2_value);

			if ((!current || dirty & /*$_*/ 1) && t4_value !== (t4_value = /*$_*/ ctx[0]('modals.switchChain.paragraph2', {
				default: en.modals.switchChain.paragraph2
			}) + "")) set_data(t4, t4_value);
		},
		i(local) {
			if (current) return;
			transition_in(closebutton.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(closebutton.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			destroy_component(closebutton);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$3(ctx) {
	let modal;
	let current;

	modal = new Modal({
			props: {
				close: /*close*/ ctx[3],
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(modal.$$.fragment);
		},
		m(target, anchor) {
			mount_component(modal, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const modal_changes = {};

			if (dirty & /*$$scope, $_*/ 33) {
				modal_changes.$$scope = { dirty, ctx };
			}

			modal.$set(modal_changes);
		},
		i(local) {
			if (current) return;
			transition_in(modal.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(modal.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(modal, detaching);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let $switchChainModal$;
	let $_;
	component_subscribe($$self, switchChainModal$, $$value => $$invalidate(4, $switchChainModal$ = $$value));
	component_subscribe($$self, _, $$value => $$invalidate(0, $_ = $$value));
	const { appMetadata } = internalState$.getValue();
	const nextNetworkName = $switchChainModal$.chain.label;

	function close() {
		switchChainModal$.next(null);
	}

	return [$_, appMetadata, nextNetworkName, close];
}

class SwitchChain extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, {}, add_css$3);
	}
}

/* src/views/shared/InfoIcon.svelte generated by Svelte v3.46.4 */

function add_css$2(target) {
	append_styles(target, "svelte-x7wzte", ".icon.svelte-x7wzte{display:flex;border-radius:50px;box-sizing:border-box;color:var(--onboard-primary-500, var(--primary-500))}");
}

function create_fragment$2(ctx) {
	let div;
	let div_style_value;

	return {
		c() {
			div = element("div");
			attr(div, "class", "icon svelte-x7wzte");
			attr(div, "style", div_style_value = `width: ${/*size*/ ctx[0]}px; height: ${/*size*/ ctx[0]}px;`);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			div.innerHTML = infoIcon;
		},
		p(ctx, [dirty]) {
			if (dirty & /*size*/ 1 && div_style_value !== (div_style_value = `width: ${/*size*/ ctx[0]}px; height: ${/*size*/ ctx[0]}px;`)) {
				attr(div, "style", div_style_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { size = 20 } = $$props;

	$$self.$$set = $$props => {
		if ('size' in $$props) $$invalidate(0, size = $$props.size);
	};

	return [size];
}

class InfoIcon extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, { size: 0 }, add_css$2);
	}
}

/* src/views/connect/ActionRequired.svelte generated by Svelte v3.46.4 */

function add_css$1(target) {
	append_styles(target, "svelte-14tlaaq", ".content.svelte-14tlaaq{padding:1rem;width:300px;font-family:var(--onboard-font-family-normal, var(--font-family-normal));font-size:var(--onboard-font-size-5, var(--font-size-5));line-height:24px}.icon-container.svelte-14tlaaq{display:flex;justify-content:center;align-items:center;width:3rem;height:3rem;background-color:var(--onboard-primary-100, var(--primary-100));border-radius:24px}h4.svelte-14tlaaq{margin:1.5rem 0 0.5rem 0;font-weight:700}p.svelte-14tlaaq{margin:0;font-weight:400}a.svelte-14tlaaq{font-weight:700}button.svelte-14tlaaq{margin-top:1.5rem;width:100%;background-color:var(--onboard-gray-500, var(--gray-500));font-weight:700;line-height:16px;color:var(--onboard-white, var(--white));justify-content:center}");
}

// (55:0) <Modal {close}>
function create_default_slot(ctx) {
	let div1;
	let div0;
	let infoicon;
	let t0;
	let h4;
	let t1_value = /*$_*/ ctx[1]('modals.actionRequired.heading', { values: { wallet: /*wallet*/ ctx[0] } }) + "";
	let t1;
	let t2;
	let p;
	let t3_value = /*$_*/ ctx[1]('modals.actionRequired.paragraph') + "";
	let t3;
	let t4;
	let a;
	let t5_value = /*$_*/ ctx[1]('modals.actionRequired.linkText') + "";
	let t5;
	let t6;
	let button;
	let t7_value = /*$_*/ ctx[1]('modals.actionRequired.buttonText') + "";
	let t7;
	let current;
	let mounted;
	let dispose;
	infoicon = new InfoIcon({});

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			create_component(infoicon.$$.fragment);
			t0 = space();
			h4 = element("h4");
			t1 = text(t1_value);
			t2 = space();
			p = element("p");
			t3 = text(t3_value);
			t4 = space();
			a = element("a");
			t5 = text(t5_value);
			t6 = space();
			button = element("button");
			t7 = text(t7_value);
			attr(div0, "class", "icon-container svelte-14tlaaq");
			attr(h4, "class", "svelte-14tlaaq");
			attr(a, "href", "https://blocknative.com/blog");
			attr(a, "target", "_blank");
			attr(a, "rel", "noreferrer noopener");
			attr(a, "class", "svelte-14tlaaq");
			attr(p, "class", "svelte-14tlaaq");
			attr(button, "class", "svelte-14tlaaq");
			attr(div1, "class", "content svelte-14tlaaq");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			mount_component(infoicon, div0, null);
			append(div1, t0);
			append(div1, h4);
			append(h4, t1);
			append(div1, t2);
			append(div1, p);
			append(p, t3);
			append(p, t4);
			append(p, a);
			append(a, t5);
			append(div1, t6);
			append(div1, button);
			append(button, t7);
			current = true;

			if (!mounted) {
				dispose = listen(button, "click", /*close*/ ctx[2]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if ((!current || dirty & /*$_, wallet*/ 3) && t1_value !== (t1_value = /*$_*/ ctx[1]('modals.actionRequired.heading', { values: { wallet: /*wallet*/ ctx[0] } }) + "")) set_data(t1, t1_value);
			if ((!current || dirty & /*$_*/ 2) && t3_value !== (t3_value = /*$_*/ ctx[1]('modals.actionRequired.paragraph') + "")) set_data(t3, t3_value);
			if ((!current || dirty & /*$_*/ 2) && t5_value !== (t5_value = /*$_*/ ctx[1]('modals.actionRequired.linkText') + "")) set_data(t5, t5_value);
			if ((!current || dirty & /*$_*/ 2) && t7_value !== (t7_value = /*$_*/ ctx[1]('modals.actionRequired.buttonText') + "")) set_data(t7, t7_value);
		},
		i(local) {
			if (current) return;
			transition_in(infoicon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(infoicon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			destroy_component(infoicon);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$1(ctx) {
	let modal;
	let current;

	modal = new Modal({
			props: {
				close: /*close*/ ctx[2],
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(modal.$$.fragment);
		},
		m(target, anchor) {
			mount_component(modal, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const modal_changes = {};

			if (dirty & /*$$scope, $_, wallet*/ 11) {
				modal_changes.$$scope = { dirty, ctx };
			}

			modal.$set(modal_changes);
		},
		i(local) {
			if (current) return;
			transition_in(modal.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(modal.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(modal, detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let $_;
	component_subscribe($$self, _, $$value => $$invalidate(1, $_ = $$value));
	let { wallet } = $$props;

	function close() {
		connectWallet$.next({ inProgress: false, actionRequired: '' });
	}

	$$self.$$set = $$props => {
		if ('wallet' in $$props) $$invalidate(0, wallet = $$props.wallet);
	};

	return [wallet, $_, close];
}

class ActionRequired extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, { wallet: 0 }, add_css$1);
	}
}

/* src/views/Index.svelte generated by Svelte v3.46.4 */

function add_css(target) {
	append_styles(target, "svelte-seg8z3", "input, textarea{background:var(--onboard-white, var(--white))}input, textarea, select{width:100%;padding:0.5rem 1rem;outline:2px solid var(--onboard-gray-200, var(--gray-200));border:none;border-radius:8px;font-size:1rem;line-height:1.5;color:var(--onboard-gray-600, var(--gray-600));transition:all 200ms ease-in-out}input[type='checkbox']{-webkit-appearance:none;width:auto;background-color:var(--onboard-white, var(--white));outline:1px solid var(--onboard-gray-300, var(--gray-300));border:none;padding:0.5em;border-radius:3px;display:flex;justify-content:center;align-items:center;position:relative;cursor:pointer}input[type='checkbox']:hover{border-color:var(\n      --onboard-checkbox-background,\n      var(--onboard-primary-500, var(--primary-500))\n    )}input[type='checkbox']:checked{background-color:var(\n      --onboard-checkbox-background,\n      var(--onboard-primary-500, var(--primary-500))\n    );border-color:var(\n      --onboard-checkbox-background,\n      var(--onboard-primary-500, var(--primary-500))\n    );color:var(--onboard-checkbox-color, var(--onboard-white, var(--white)))}input[type='checkbox']:checked:after{content:url(\"data:image/svg+xml,%3Csvg width='0.885em' height='0.6em' viewBox='0 0 14 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 6L5 11L14 2L12.59 0.58L5 8.17L1.41 4.59L0 6Z' fill='white'/%3E%3C/svg%3E\");font-size:12px;position:absolute;color:var(--onboard-checkbox-color, var(--onboard-white, var(--white)))}input:hover, textarea:hover, select:hover{border-color:var(\n      --onboard-checkbox-color,\n      var(--onboard-white, var(--white))\n    )}input:focus, textarea.focus, select:focus{border-color:var(--onboard-primary-500, var(--primary-500));box-shadow:0 0 1px 1px\n      var(\n        --onboard-checkbox-background,\n        var(--onboard-primary-500, var(--primary-500))\n      );box-shadow:0 0 0 1px -moz-mac-focusring}input:disabled, textarea:disabled, select:disabled{background-color:var(--gray-100)}input::-moz-focus-inner{outline:0;padding:0;margin-top:-2px;margin-bottom:-2px}::-webkit-input-placeholder{color:var(--gray-300)}::-moz-placeholder{color:var(--gray-300)}:-ms-input-placeholder{color:var(--gray-300)}:-moz-placeholder{color:var(--gray-300)}a{color:var(\n      --onboard-link-color,\n      var(--onboard-primary-500, var(--primary-500))\n    );text-decoration:none}button{display:flex;align-items:center;padding:calc(var(--onboard-spacing-4, var(--spacing-4)) - 1px);border-radius:24px;cursor:pointer;font:inherit;border:none}.onboard-button-primary{background:var(--onboard-white, var(--white));padding:calc(var(--onboard-spacing-5, var(--spacing-5)) - 1px)\n      calc(var(--onboard-spacing-4, var(--spacing-4)) - 1px);color:var(--onboard-gray-500, var(--gray-500));font-size:var(--onboard-font-size-6, var(--font-size-6));line-height:var(--onboard-font-line-height-3, var(--font-line-height-3));border:1px solid var(--onboard-gray-500, var(--gray-500));font-weight:700}");
}

// (140:0) {#if $connectWallet$.inProgress}
function create_if_block_2(ctx) {
	let connect;
	let current;

	connect = new Index$1({
			props: {
				autoSelect: /*$connectWallet$*/ ctx[0].autoSelect
			}
		});

	return {
		c() {
			create_component(connect.$$.fragment);
		},
		m(target, anchor) {
			mount_component(connect, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const connect_changes = {};
			if (dirty & /*$connectWallet$*/ 1) connect_changes.autoSelect = /*$connectWallet$*/ ctx[0].autoSelect;
			connect.$set(connect_changes);
		},
		i(local) {
			if (current) return;
			transition_in(connect.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(connect.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(connect, detaching);
		}
	};
}

// (144:0) {#if $connectWallet$.actionRequired}
function create_if_block_1(ctx) {
	let actionrequired;
	let current;

	actionrequired = new ActionRequired({
			props: {
				wallet: /*$connectWallet$*/ ctx[0].actionRequired
			}
		});

	return {
		c() {
			create_component(actionrequired.$$.fragment);
		},
		m(target, anchor) {
			mount_component(actionrequired, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const actionrequired_changes = {};
			if (dirty & /*$connectWallet$*/ 1) actionrequired_changes.wallet = /*$connectWallet$*/ ctx[0].actionRequired;
			actionrequired.$set(actionrequired_changes);
		},
		i(local) {
			if (current) return;
			transition_in(actionrequired.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(actionrequired.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(actionrequired, detaching);
		}
	};
}

// (148:0) {#if $switchChainModal$}
function create_if_block(ctx) {
	let switchchain;
	let current;
	switchchain = new SwitchChain({});

	return {
		c() {
			create_component(switchchain.$$.fragment);
		},
		m(target, anchor) {
			mount_component(switchchain, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(switchchain.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(switchchain.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(switchchain, detaching);
		}
	};
}

function create_fragment(ctx) {
	let t0;
	let t1;
	let if_block2_anchor;
	let current;
	let if_block0 = /*$connectWallet$*/ ctx[0].inProgress && create_if_block_2(ctx);
	let if_block1 = /*$connectWallet$*/ ctx[0].actionRequired && create_if_block_1(ctx);
	let if_block2 = /*$switchChainModal$*/ ctx[1] && create_if_block();

	return {
		c() {
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();
		},
		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t0, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, t1, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert(target, if_block2_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*$connectWallet$*/ ctx[0].inProgress) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*$connectWallet$*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t0.parentNode, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*$connectWallet$*/ ctx[0].actionRequired) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*$connectWallet$*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(t1.parentNode, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (/*$switchChainModal$*/ ctx[1]) {
				if (if_block2) {
					if (dirty & /*$switchChainModal$*/ 2) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block();
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block2);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(if_block2);
			current = false;
		},
		d(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach(t0);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(t1);
			if (if_block2) if_block2.d(detaching);
			if (detaching) detach(if_block2_anchor);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let $connectWallet$;
	let $switchChainModal$;
	component_subscribe($$self, connectWallet$, $$value => $$invalidate(0, $connectWallet$ = $$value));
	component_subscribe($$self, switchChainModal$, $$value => $$invalidate(1, $switchChainModal$ = $$value));
	return [$connectWallet$, $switchChainModal$];
}

class Index extends SvelteComponent {
	constructor(options) {
		super();
		init$1(this, options, instance, create_fragment, safe_not_equal, {}, add_css);
	}
}

const API = {
    connectWallet: connect$1,
    disconnectWallet: disconnect,
    setChain,
    state
};
function init(options) {
    if (typeof window === 'undefined')
        return API;
    if (options) {
        const error = validateInitOptions(options);
        if (error) {
            throw error;
        }
    }
    const { wallets, chains, appMetadata = null, i18n } = options;
    initialize(i18n);
    addChains(chains);
    const { svelteInstance } = internalState$.getValue();
    if (svelteInstance) {
        // if already initialized, need to cleanup old instance
        console.warn('Re-initializing Onboard and resetting back to initial state');
        reset$.next();
    }
    const device = getDeviceInfo();
    const walletModules = wallets.reduce((acc, walletInit) => {
        const initialized = walletInit({ device });
        if (initialized) {
            // injected wallets is an array of wallets
            acc.push(...(Array.isArray(initialized) ? initialized : [initialized]));
        }
        return acc;
    }, []);
    const app = svelteInstance || mountApp();
    internalState$.next({
        appMetadata,
        svelteInstance: app,
        walletModules,
        device
    });
    return API;
}
function mountApp() {
    class Onboard extends HTMLElement {
        constructor() {
            super();
        }
    }
    if (!customElements.get('onboard-v2')) {
        customElements.define('onboard-v2', Onboard);
    }
    // Add Fonts to main page
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
    ${SofiaProRegular}
  `;
    document.body.appendChild(styleEl);
    // add to DOM
    const onboard = document.createElement('onboard-v2');
    const target = onboard.attachShadow({ mode: 'open' });
    onboard.style.all = 'initial';
    target.innerHTML = `
      <style>
        :host {  
          /* COLORS */
          --white: white;
          --black: black;
          --primary-1: #2F80ED;
          --primary-100: #eff1fc;
          --primary-200: #d0d4f7;
          --primary-300: #b1b8f2;
          --primary-400: #929bed;
          --primary-500: #6370e5;
          --primary-600: #454ea0;
          --primary-700: #323873;
          --gray-100: #ebebed;
          --gray-200: #c2c4c9;
          --gray-300: #999ca5;
          --gray-400: #707481;
          --gray-500: #33394b;
          --gray-600: #242835;
          --gray-700: #1a1d26;
          --success-100: #d1fae3;
          --success-200: #baf7d5;
          --success-300: #a4f4c6;
          --success-400: #8df2b8;
          --success-500: #5aec99;
          --success-600: #18ce66;
          --success-700: #129b4d;
          --danger-100: #ffe5e6;
          --danger-200: #ffcccc;
          --danger-300: #ffb3b3;
          --danger-400: #ff8080;
          --danger-500: #ff4f4f;
          --danger-600: #cc0000;
          --danger-700: #660000;
          --warning-100: #ffefcc;
          --warning-200: #ffe7b3;
          --warning-300: #ffd780;
          --warning-400: #ffc74c;
          --warning-500: #ffaf00;
          --warning-600: #cc8c00;
          --warning-700: #664600;
  
          /* FONTS */
          --font-family-normal: Sofia Pro;
  
          --font-size-1: 3rem;
          --font-size-2: 2.25rem;
          --font-size-3: 1.5rem;
          --font-size-4: 1.25rem;
          --font-size-5: 1rem;
          --font-size-6: .875rem;
          --font-size-7: .75rem;
  
          --font-line-height-1: 24px;
          --font-line-height-2: 20px;
          --font-line-height-3: 16px;
          --font-line-height-4: 12px;
  
          /* SPACING */
          --spacing-1: 3rem;
          --spacing-2: 2rem;
          --spacing-3: 1.5rem;
          --spacing-4: 1rem;
          --spacing-5: 0.5rem;
  
          /* SHADOWS */
          --shadow-1: 0px 4px 12px rgba(0, 0, 0, 0.1);
          --shadow-2: inset 0px -1px 0px rgba(0, 0, 0, 0.1);

          --modal-z-index: 10;
        }
      </style>
    `;
    document.body.appendChild(onboard);
    const app = new Index({
        target
    });
    return app;
}

export { init as default };
