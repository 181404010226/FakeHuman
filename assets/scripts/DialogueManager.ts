import { _decorator, Component, Node, Label, Tween, tween, Vec3, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DialogueManager')
export class DialogueManager extends Component {
    @property({
        type: Node,
        tooltip: '对话框节点'
    })
    dialogueNode: Node = null;

    @property({
        type: Label,
        tooltip: '显示对话内容的文本标签'
    })
    dialogueLabel: Label = null;

    @property({
        tooltip: '对话框弹出动画持续时间(秒)'
    })
    popupDuration: number = 0.3;

    @property({
        tooltip: '对话框缩放前的初始大小(比例)'
    })
    initialScale: number = 0.5;

    @property({
        tooltip: '对话框最终大小(比例)'
    })
    targetScale: number = 1.0;

    private currentDialogue: string = '';
    private dialogueAnimation: Tween<Node> = null;

    start() {
        // 确保对话框初始隐藏
        if (this.dialogueNode) {
            this.dialogueNode.active = false;
        }
    }

    /**
     * 显示新对话
     * @param text 对话内容，如果为空则重复当前对话
     */
    public showDialogue(text: string = ''): void {
        // 如果传入的文本为空，则使用当前对话
        const dialogueText = text || this.currentDialogue;
        
        // 如果对话为空，则不执行任何操作
        if (!dialogueText) {
            return;
        }
        
        // 保存当前对话文本
        this.currentDialogue = dialogueText;
        
        // 设置对话内容
        if (this.dialogueLabel) {
            this.dialogueLabel.string = dialogueText;
        }
        
        // 显示对话框并播放弹出动画
        this.playPopupAnimation();
    }

    /**
     * 播放对话框弹出动画
     */
    private playPopupAnimation(): void {
        if (!this.dialogueNode) {
            return;
        }

        // 停止正在播放的动画（如果有）
        if (this.dialogueAnimation) {
            this.dialogueAnimation.stop();
        }

        // 显示对话框
        this.dialogueNode.active = true;
        
        // 设置初始缩放
        this.dialogueNode.setScale(new Vec3(this.initialScale, this.initialScale, 1));
        
        // 创建弹出动画
        this.dialogueAnimation = tween(this.dialogueNode)
            .to(this.popupDuration, { scale: new Vec3(this.targetScale, this.targetScale, 1) }, {
                easing: 'elasticOut'
            })
            .start();
    }

    /**
     * 隐藏对话框
     */
    public hideDialogue(): void {
        if (this.dialogueNode) {
            // 停止正在播放的动画（如果有）
            if (this.dialogueAnimation) {
                this.dialogueAnimation.stop();
            }
            
            // 隐藏对话框并重置缩放
            this.dialogueNode.active = false;
            this.dialogueNode.setScale(new Vec3(this.initialScale, this.initialScale, 1));
        }
    }

    /**
     * 判断对话框是否正在显示
     */
    public isDialogueShowing(): boolean {
        return this.dialogueNode ? this.dialogueNode.active : false;
    }
} 