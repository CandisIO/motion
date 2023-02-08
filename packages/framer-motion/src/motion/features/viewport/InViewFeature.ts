import { AnimationType } from "../../../render/utils/types"
import { Feature } from "../Feature"
import { observeIntersection } from "./observers"

const thresholdNames = {
    some: 0,
    all: 1,
}

export class InViewFeature extends Feature<Element> {
    private hasEnteredView = false

    private isInView = false

    private removeObserver?: Function

    private startObserver() {
        // TODD Diff  root, rootMargin, amount before blindly restarting
        // Double check we dont already do this in observers.ts

        this.removeObserver?.()

        const { viewport = {} } = this.node.getProps()
        const { root, margin: rootMargin, amount = "some", once } = viewport

        const options = {
            root: root?.current,
            rootMargin,
            threshold:
                typeof amount === "number" ? amount : thresholdNames[amount],
        }

        const onIntersectionUpdate = (entry: IntersectionObserverEntry) => {
            const { isIntersecting } = entry

            /**
             * If there's been no change in the viewport state, early return.
             */
            if (this.isInView === isIntersecting) return

            this.isInView = isIntersecting

            /**
             * Handle hasEnteredView. If this is only meant to run once, and
             * element isn't visible, early return. Otherwise set hasEnteredView to true.
             */
            if (once && !isIntersecting && this.hasEnteredView) {
                return
            } else if (isIntersecting) {
                this.hasEnteredView = true
            }

            if (this.node.animationState) {
                this.node.animationState.setActive(
                    AnimationType.InView,
                    isIntersecting
                )
            }

            /**
             * Use the latest committed props rather than the ones in scope
             * when this observer is created
             */
            const { onViewportEnter, onViewportLeave } = this.node.getProps()
            const callback = isIntersecting ? onViewportEnter : onViewportLeave
            callback && callback(entry)
        }

        return observeIntersection(
            this.node.current!,
            options,
            onIntersectionUpdate
        )
    }

    mount() {
        this.startObserver()
    }

    update() {
        this.startObserver()
    }

    unmount() {
        this.removeObserver?.()
    }
}