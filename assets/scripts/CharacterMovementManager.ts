import { _decorator, Component, Node, Button, Vec3, tween, Tween } from 'cc';
import { DialogueManager } from './DialogueManager';
const { ccclass, property } = _decorator;

@ccclass('CharacterMovementManager')
export class CharacterMovementManager extends Component {
    @property({
        type: DialogueManager,
        tooltip: '对话框管理器'
    })
    dialogueManager: DialogueManager = null;

    @property({
        type: Node,
        tooltip: '人物节点'
    })
    characterNode: Node = null;

    @property({
        type: Button,
        tooltip: '放行按钮（向右移动）'
    })
    letPassButton: Button = null;

    @property({
        type: Button,
        tooltip: '赶走按钮（向左移动）'
    })
    dismissButton: Button = null;

    @property({
        tooltip: '人物移动动画持续时间(秒)'
    })
    moveDuration: number = 1.0;

    @property({
        tooltip: '人物移动距离（像素）'
    })
    moveDistance: number = 300;
    
    private initialPosition: Vec3 = null;
    private currentAnimation: Tween<Node> = null;

    start() {
        // 记录人物初始位置
        if (this.characterNode) {
            this.initialPosition = this.characterNode.position.clone();
        }

        // 设置按钮事件监听
        if (this.letPassButton) {
            this.letPassButton.node.on(Button.EventType.CLICK, this.moveCharacterRight, this);
        }

        if (this.dismissButton) {
            this.dismissButton.node.on(Button.EventType.CLICK, this.moveCharacterLeft, this);
        }
        
    
    }
    

    /**
     * 人物移动到右侧（放行）
     */
    public moveCharacterRight(): void {
        if (!this.characterNode || !this.initialPosition) return;

        // 隐藏对话框
        if (this.dialogueManager) {
            this.dialogueManager.hideDialogue();
        }

        // 停止当前动画
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // 目标位置：向右移动
        const targetPos = new Vec3(
            this.initialPosition.x + this.moveDistance,
            this.initialPosition.y,
            this.initialPosition.z
        );

        // 创建动画
        this.currentAnimation = tween(this.characterNode)
            .to(this.moveDuration, { position: targetPos }, { easing: 'cubicOut' })
            .call(() => {
                // 动画完成回调
                this.currentAnimation = null;
            })
            .start();
    }

    /**
     * 人物移动到左侧（赶走）
     */
    public moveCharacterLeft(): void {
        if (!this.characterNode || !this.initialPosition) return;

        // 隐藏对话框
        if (this.dialogueManager) {
            this.dialogueManager.hideDialogue();
        }

        // 停止当前动画
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // 目标位置：向左移动
        const targetPos = new Vec3(
            this.initialPosition.x - this.moveDistance,
            this.initialPosition.y,
            this.initialPosition.z
        );

        // 创建动画
        this.currentAnimation = tween(this.characterNode)
            .to(this.moveDuration, { position: targetPos }, { easing: 'cubicOut' })
            .call(() => {
                // 动画完成回调
                this.currentAnimation = null;
            })
            .start();
    }

    /**
     * 新人物从左向右进入
     */
    public characterEnter(): void {
        console.log('characterEnter');
        if (!this.characterNode) return;

        // 隐藏对话框
        if (this.dialogueManager) {
            this.dialogueManager.hideDialogue();
        }

        // 停止当前动画
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // 设置起始位置（在左侧）
        const startPos = new Vec3(
            this.initialPosition.x - this.moveDistance,
            this.initialPosition.y,
            this.initialPosition.z
        );
        this.characterNode.position = startPos;

        // 创建动画，移动到初始位置
        this.currentAnimation = tween(this.characterNode)
            .to(this.moveDuration, { position: this.initialPosition }, { easing: 'cubicOut' })
            .call(() => {
                // 动画完成回调
                this.currentAnimation = null;
            })
            .start();
    }

    /**
     * 重置人物位置到初始位置
     */
    public resetCharacterPosition(): void {
        if (this.characterNode && this.initialPosition) {
            // 停止当前动画
            if (this.currentAnimation) {
                this.currentAnimation.stop();
                this.currentAnimation = null;
            }

            // 直接设置到初始位置
            this.characterNode.position = this.initialPosition.clone();
        }
    }

    onDestroy() {
        // 移除按钮事件监听
        if (this.letPassButton) {
            this.letPassButton.node.off(Button.EventType.CLICK, this.moveCharacterRight, this);
        }

        if (this.dismissButton) {
            this.dismissButton.node.off(Button.EventType.CLICK, this.moveCharacterLeft, this);
        }
    }
}