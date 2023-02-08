import { addPointerEvent } from "../events/use-pointer-event"
import { AnimationType } from "../render/utils/types"
import { pipe } from "../utils/pipe"
import { isDragActive } from "./drag/utils/lock"
import { EventInfo } from "../events/types"
import type { VisualElement as MotionNode } from "../render/VisualElement"
import { Feature } from "../motion/features/Feature"
import { noop } from "../utils/noop"

function addHoverEvent(node: MotionNode<Element>, isActive: boolean) {
    const eventName = "pointer" + (isActive ? "enter" : "leave")
    const callbackName = "onHover" + (isActive ? "Start" : "End")

    const handleEvent = (event: PointerEvent, info: EventInfo) => {
        if (event.type === "touch" || isDragActive()) return

        const props = node.getProps()

        if (node.animationState && props.whileHover) {
            node.animationState.setActive(AnimationType.Hover, isActive)
        }

        if (props[callbackName]) {
            props[callbackName](event, info)
        }
    }

    return addPointerEvent(node.current!, eventName, handleEvent, {
        passive: !node.getProps()[callbackName],
    })
}

export class HoverGesture extends Feature<Element> {
    private removeEventListeners: Function = noop

    mount() {
        this.removeEventListeners = pipe(
            addHoverEvent(this.node, true),
            addHoverEvent(this.node, false)
        )
    }

    unmount() {
        this.removeEventListeners()
    }
}