import { CurrentStateValue, OldStateValue } from '../main';
import { Control } from '../structure-file';
import { ControlBase, ControlType } from './control-base';

export class Dimmer extends ControlBase {
    async loadAsync(type: ControlType, uuid: string, control: Control): Promise<void> {
        await this.updateObjectAsync(uuid, {
            type: type,
            common: {
                name: control.name,
                role: 'light',
            },
            native: { control: control as any },
        });

        await this.loadOtherControlStatesAsync(control.name, uuid, control.states, ['position', 'min', 'max', 'step']);

        await this.createSimpleControlStateObjectAsync(
            control.name,
            uuid,
            control.states,
            'position',
            'number',
            'level.dimmer',
            { write: true },
        );
        await this.createSimpleControlStateObjectAsync(control.name, uuid, control.states, 'min', 'number', 'value');
        await this.createSimpleControlStateObjectAsync(control.name, uuid, control.states, 'max', 'number', 'value');
        await this.createSimpleControlStateObjectAsync(control.name, uuid, control.states, 'step', 'number', 'value');

        this.addStateChangeListener(uuid + '.position', (oldValue: OldStateValue, newValue: CurrentStateValue) => {
            this.sendCommand(control.uuidAction, this.convertStateToInt(newValue).toString());
        });

        await this.createButtonCommandStateObjectAsync(control.name, uuid, 'on');
        this.addStateChangeListener(uuid + '.on', () => {
            this.sendCommand(control.uuidAction, 'on');
        });

        await this.createButtonCommandStateObjectAsync(control.name, uuid, 'off');
        this.addStateChangeListener(uuid + '.off', () => {
            this.sendCommand(control.uuidAction, 'off');
        });
    }
}
