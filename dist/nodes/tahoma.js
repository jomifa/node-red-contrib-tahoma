"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var somfy_api_1 = require("../core/somfy-api");
// ROTATION command: 'setOrientation' works on local API. 'rotation' seems to be legacy command not anymore used ? Modifier to avoid issues with local API according to marekhalmo as mentioned in issue #62 on nikkow/node-red-contrib-tahoma 
var TahomaCommands;
(function (TahomaCommands) {
    TahomaCommands["OPEN"] = "open";
    TahomaCommands["CLOSE"] = "close";
    TahomaCommands["ROTATION"] = "setOrientation";
    TahomaCommands["STOP"] = "stop";
    TahomaCommands["SET_CLOSURE"] = "setClosure";
    TahomaCommands["SET_CLOSURE_AND_ORIENTATION"] = "setClosureAndOrientation";
    TahomaCommands["ON"] = "on";
    TahomaCommands["OFF"] = "off";
    TahomaCommands["SET_INTENSITY"] = "setIntensity";
    TahomaCommands["SET_ONOFF"] = "setOnOff";
    TahomaCommands["TOGGLE"] = "toggle";
    TahomaCommands["WINK"] = "wink";
})(TahomaCommands || (TahomaCommands = {}));
var STATE_VALIDATOR_POLLING_DELAY = 2500; // Check every 2.5 seconds, until expected state is reached.
var validateStatus = function (configNode, execId) {
    return new Promise(function (resolve) {
        return setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
            var somfyClient, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        somfyClient = new somfy_api_1.SomfyApi(configNode);
                        return [4 /*yield*/, somfyClient.getStatusForExecutionId(execId)];
                    case 1:
                        status = _a.sent();
                        resolve(status === null);
                        return [2 /*return*/];
                }
            });
        }); }, STATE_VALIDATOR_POLLING_DELAY);
    });
};
var continueWhenCompleted = function (configNode, execId) {
    return validateStatus(configNode, execId).then(function (isFinished) {
        if (!isFinished) {
            return continueWhenCompleted(configNode, execId);
        }
    });
};
function getBoolean(value) {
    switch (String(value).toLowerCase()) {
        case 'true':
        case '1':
        case 'on':
        case 'yes':
            return true;
    }
    return false;
}
function generateInstructionsFromPayload(payload) {
    switch (payload.action) {
        case 'open':
            return {
                command: TahomaCommands.OPEN,
                expectedState: { open: true, position: 0 },
                labels: {
                    done: 'Open',
                    progress: 'Opening...',
                },
            };
        case 'close':
            return {
                command: TahomaCommands.CLOSE,
                expectedState: { open: false, position: 100 },
                labels: {
                    done: 'Closed',
                    progress: 'Closing...',
                },
            };
        case 'customPosition':
            return {
                command: TahomaCommands.SET_CLOSURE,
                expectedState: {
                    open: true,
                    position: parseInt(payload.position, 10),
                },
                labels: {
                    done: "Set to ".concat(payload.position),
                    progress: "Setting to ".concat(payload.position),
                },
                parameters: [parseInt(payload.position, 10)],
            };
        case 'customRotation':
        case 'customOrientation':
            return {
                command: TahomaCommands.ROTATION,
                expectedState: { orientation: parseInt(payload.orientation, 10) },
                labels: {
                    done: "Rotated to ".concat(payload.orientation),
                    progress: "Rotating to ".concat(payload.orientation, "..."),
                },
                parameters: [parseInt(payload.orientation, 10)],
            };
        case 'customClosureAndOrientation':
            return {
                command: TahomaCommands.SET_CLOSURE_AND_ORIENTATION,
                expectedState: {
                    position: parseInt(payload.position, 10),
                    orientation: parseInt(payload.orientation, 10)
                },
                labels: {
                    done: "Set to position:".concat(payload.position, ", orientation:").concat(payload.orientation),
                    progress: "Moving to position:".concat(payload.position, ", orientation:").concat(payload.orientation, "..."),
                },
                parameters: [
                    parseInt(payload.position, 10),
                    parseInt(payload.orientation, 10),
                ],
            };
        case 'stop':
            return {
                command: TahomaCommands.STOP,
                labels: {
                    done: "Stopped",
                    progress: "Stopping...",
                },
            };
        case 'on':
            return {
                command: TahomaCommands.ON,
                labels: {
                    done: "On",
                    progress: "Turning on...",
                },
                // expectedState: { onOff: "on"},
            };
        case 'off':
            return {
                command: TahomaCommands.OFF,
                labels: {
                    done: "Off",
                    progress: "Turning off...",
                },
                // expectedState: { onOff: "off"},
            };
        case 'toggle':
            return {
                command: TahomaCommands.TOGGLE,
                labels: {
                    done: "Toggled",
                    progress: "Toggling state ...",
                },
                // expectedState: { onOff: "off"},
            };
        case 'setOnOff':
            return {
                command: TahomaCommands.SET_ONOFF,
                labels: {
                    done: "".concat(payload.onOff),
                    progress: "Turning ".concat(payload.onOff, "..."),
                },
                // expectedState: { onOff: "off"},
                parameters: [+getBoolean(payload.onOff)],
            };
        case 'setIntensity':
            return {
                command: TahomaCommands.SET_INTENSITY,
                labels: {
                    done: "Set intensity to ".concat(payload.intensity),
                    progress: "Setting intensity to ".concat(payload.intensity),
                },
                // expectedState: { intensity: payload.intensity},
                parameters: [payload.intensity],
            };
        case 'wink':
            return {
                command: TahomaCommands.WINK,
                expectedState: { repetitions: parseInt(payload.repetitions, 10) },
                labels: {
                    done: "Stopped",
                    progress: "Winking ".concat(payload.repetitions, " time(s)"),
                },
                parameters: [parseInt(payload.repetitions, 10)],
            };
        default:
            return null;
    }
}
module.exports = function (RED) {
    RED.nodes.registerType('tahoma', function (props) {
        var _this = this;
        RED.nodes.createNode(this, props);
        this['device'] = props.device;
        this['tahomabox'] = props.tahomabox;
        this['name'] = props.name;
        this.on('input', function (msg) {
            var instructions = generateInstructionsFromPayload(msg.payload);
            if (instructions === null) {
                return;
            }
            var command = {
                name: instructions.command,
                parameters: instructions.parameters || [],
            };
            if (msg.payload.lowspeed && instructions.command !== 'stop') {
                var targetPosition = instructions.expectedState.position || 0;
                command.name = 'position_low_speed';
                command.parameters = [targetPosition];
            }
            _this.status({
                fill: 'yellow',
                shape: 'dot',
                text: instructions.labels.progress,
            });
            var configNode = RED.nodes.getNode(_this['tahomabox']);
            var somfyApiClient = new somfy_api_1.SomfyApi(configNode);
            somfyApiClient
                .execute(_this['device'], command)
                .then(function (commandExecutionResponse) {
                if (!instructions.expectedState) {
                    _this.status({ fill: 'grey', shape: 'dot', text: 'Unknown' });
                    _this.send(msg);
                    return;
                }
                var execId = commandExecutionResponse.execId;
                continueWhenCompleted(configNode, execId).then(function () {
                    _this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: instructions.labels.done,
                    });
                    _this.send(msg);
                });
            });
        });
    });
};
