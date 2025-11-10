"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeAction = exports.PermissionActions = void 0;
var PermissionActions;
(function (PermissionActions) {
    PermissionActions["CREATE"] = "createAction";
    PermissionActions["READ"] = "readAction";
    PermissionActions["UPDATE"] = "updateAction";
    PermissionActions["DELETE"] = "deleteAction";
})(PermissionActions || (exports.PermissionActions = PermissionActions = {}));
var ScopeAction;
(function (ScopeAction) {
    ScopeAction["APPROVE"] = "APPROVE";
    ScopeAction["DELIVERY"] = "DELIVERY";
    ScopeAction["ASSIGN"] = "ASSIGN";
    ScopeAction["FULL"] = "FULL";
    ScopeAction["MINIMUM"] = "MINIMUM";
})(ScopeAction || (exports.ScopeAction = ScopeAction = {}));
//# sourceMappingURL=permission-actions.enum.js.map