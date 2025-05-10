import { _decorator, Component, Node, Button, Vec3, Color, UIOpacity, Enum } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Button effect types
 */
enum ButtonEffectType {
    MOVE_DOWN = 0,
    DARKEN = 1
}

@ccclass('ButtonEffectsManager')
export class ButtonEffectsManager extends Component {
    @property({
        type: [Button],
        tooltip: 'The buttons to apply effects to'
    })
    buttons: Button[] = [];

    @property({
        type: Enum(ButtonEffectType),
        tooltip: 'Effect type: 0 for move down, 1 for darken'
    })
    effectType: ButtonEffectType = ButtonEffectType.MOVE_DOWN;

    @property({
        tooltip: 'How much to move the button down (in pixels)',
        visible: function(this: ButtonEffectsManager) {
            return this.effectType === ButtonEffectType.MOVE_DOWN;
        }
    })
    moveDistance: number = 5;

    @property({
        tooltip: 'How much to darken the button (0-1)',
        range: [0, 1, 0.05],
        slide: true,
        visible: function(this: ButtonEffectsManager) {
            return this.effectType === ButtonEffectType.DARKEN;
        }
    })
    darkenAmount: number = 0.2;

    private originalPositions: Map<string, Vec3> = new Map();
    private originalOpacities: Map<string, number> = new Map();

    start() {
        // Register all buttons
        this.registerButtons();
    }

    /**
     * Register all buttons in the buttons array
     */
    registerButtons() {
        this.buttons.forEach(button => {
            if (button) {
                this.registerButton(button);
            }
        });
    }

    /**
     * Register a single button with press effects
     * @param button The button to register
     */
    registerButton(button: Button) {
        const buttonNode = button.node;
        const buttonId = buttonNode.uuid;

        // Store original position for move effect
        if (this.effectType === ButtonEffectType.MOVE_DOWN) {
            const originalPos = buttonNode.position.clone();
            this.originalPositions.set(buttonId, originalPos);
        } 
        // Store original opacity for darken effect
        else if (this.effectType === ButtonEffectType.DARKEN) {
            const uiOpacity = buttonNode.getComponent(UIOpacity);
            if (uiOpacity) {
                this.originalOpacities.set(buttonId, uiOpacity.opacity);
            } else {
                // Add UIOpacity if it doesn't exist
                const newUIOpacity = buttonNode.addComponent(UIOpacity);
                this.originalOpacities.set(buttonId, newUIOpacity.opacity);
            }
        }

        // Add button events
        button.node.on(Node.EventType.TOUCH_START, () => this.onButtonPressed(buttonId), this);
        button.node.on(Node.EventType.TOUCH_END, () => this.onButtonReleased(buttonId), this);
        button.node.on(Node.EventType.TOUCH_CANCEL, () => this.onButtonReleased(buttonId), this);
    }

    /**
     * Handle button press
     * @param buttonId The unique ID of the button
     */
    onButtonPressed(buttonId: string) {
        const button = this.getButtonById(buttonId);
        if (!button) return;

        if (this.effectType === ButtonEffectType.MOVE_DOWN) {
            const originalPos = this.originalPositions.get(buttonId);
            if (originalPos) {
                const newPos = originalPos.clone();
                newPos.y -= this.moveDistance;
                button.node.position = newPos;
            }
        } else if (this.effectType === ButtonEffectType.DARKEN) {
            const uiOpacity = button.node.getComponent(UIOpacity);
            if (uiOpacity) {
                const originalOpacity = this.originalOpacities.get(buttonId) || 255;
                uiOpacity.opacity = originalOpacity * (1 - this.darkenAmount);
            }
        }
    }

    /**
     * Handle button release
     * @param buttonId The unique ID of the button
     */
    onButtonReleased(buttonId: string) {
        const button = this.getButtonById(buttonId);
        if (!button) return;

        if (this.effectType === ButtonEffectType.MOVE_DOWN) {
            const originalPos = this.originalPositions.get(buttonId);
            if (originalPos) {
                button.node.position = originalPos.clone();
            }
        } else if (this.effectType === ButtonEffectType.DARKEN) {
            const uiOpacity = button.node.getComponent(UIOpacity);
            if (uiOpacity) {
                const originalOpacity = this.originalOpacities.get(buttonId) || 255;
                uiOpacity.opacity = originalOpacity;
            }
        }
    }

    /**
     * Find a button by its ID
     * @param buttonId The unique ID of the button
     * @returns The button component or null if not found
     */
    private getButtonById(buttonId: string): Button | null {
        for (const button of this.buttons) {
            if (button && button.node.uuid === buttonId) {
                return button;
            }
        }
        return null;
    }

    /**
     * Manually add a button to the manager
     * @param button The button to add
     */
    public addButton(button: Button) {
        if (!this.buttons.some(btn => btn === button)) {
            this.buttons.push(button);
            this.registerButton(button);
        }
    }

    /**
     * Remove a button from the manager
     * @param button The button to remove
     */
    public removeButton(button: Button) {
        const index = this.buttons.indexOf(button);
        if (index !== -1) {
            const buttonId = button.node.uuid;
            
            // Remove event listeners
            button.node.off(Node.EventType.TOUCH_START, () => this.onButtonPressed(buttonId), this);
            button.node.off(Node.EventType.TOUCH_END, () => this.onButtonReleased(buttonId), this);
            button.node.off(Node.EventType.TOUCH_CANCEL, () => this.onButtonReleased(buttonId), this);
            
            // Remove button from array
            this.buttons.splice(index, 1);
            
            // Clean up stored data
            this.originalPositions.delete(buttonId);
            this.originalOpacities.delete(buttonId);
        }
    }
} 