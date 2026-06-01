// TODO:
// One more improvement (strongly recommended)
// Right now you're animating with max-height: 500px.
// That will break when content grows.
// Better pattern:
// .window-content {
//     grid-template-rows: 1fr;
// }
// OR JS-driven height measurement (more advanced)

export class WindowFrame {

    public element: HTMLElement;
    private header: HTMLElement;
    private content: HTMLElement;

    private expanded = true;

    private onClose?: () => void;
    private cleanup?: () => void;

    constructor(title: string) {

        this.element = document.createElement('div');
        this.element.classList.add('window', 'column', 'absolute', 'center-xy');

        this.header = this.createHeader(title);
        this.content = document.createElement('div');
        this.content.classList.add('window-content');

        this.element.appendChild(this.header);
        this.element.appendChild(this.content);

        this.enableDrag();
        // this.enableResize(); // TODO:

    }

    public setContent(el: HTMLElement) {

        this.content.innerHTML = '';
        this.content.appendChild(el);

    }

    private createHeader(title: string) {

        const header = document.createElement('div');
        header.classList.add('window-header', 'row');

        const titleEl = document.createElement('div');
        titleEl.innerText = title;
        titleEl.classList.add('flex-1', 'center', 'padded');

        const btnClose = document.createElement('button');
        btnClose.innerText = 'x';

        const btnMin = document.createElement('button');
        btnMin.innerText = '-';

        // TODO: handle for resizing the window
        // const handle = document.createElement('div');
        // handle.classList.add('window-resize-handle');

        btnClose.onclick = () => {

            this.cleanup?.();
            this.onClose?.();

        }

        btnMin.addEventListener('click', (e) => {

            this.expanded = !this.expanded;
            this.element.classList.toggle('collapsed', !this.expanded);

        });


        header.appendChild(titleEl);
        // this.element.appendChild(handle);
        header.appendChild(btnMin);
        header.appendChild(btnClose);

        return header;
    }

    public onCloseClick(fn: () => void) {

        this.onClose = fn;

    }

    private enableDrag() {

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const onPointerMove = (e: PointerEvent) => {

            if (!isDragging) return;

            this.element.style.left = `${e.clientX - offsetX}px`;
            this.element.style.top = `${e.clientY - offsetY}px`;
        };

        const onPointerUp = () => {

            isDragging = false;

        }

        this.header.addEventListener('pointerdown', (e) => {

            // ignore buttons
            if ((e.target as HTMLElement).tagName === 'BUTTON') return;

            isDragging = true;

            const rect = this.element.getBoundingClientRect();

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // remove centering to prevent jumping
            this.element.classList.remove('center-xy');

            this.element.style.left = `${rect.left}px`;
            this.element.style.top = `${rect.top}px`;

            this.element.style.position = 'absolute';

            // capture pointer (important for mobile)
            (e.target as HTMLElement).setPointerCapture(e.pointerId);

        });

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        this.cleanup = () => {

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pionterup', onPointerUp);
        }

    }

    private enableResize() {

        let isResizing = false;

        const handle = document.createElement('div');
        handle.classList.add('window-resize-handle');
        this.element.appendChild(handle);

        handle.addEventListener('pointerdown', (e) => {

            e.preventDefault();
            isResizing = true;
            handle.setPointerCapture(e.pointerId);

        });

        const onMove = (e: PointerEvent) => {

            if (!isResizing) return;

            this.element.style.width = `${e.clientX - this.element.offsetLeft}px`;
            this.element.style.height = `${e.clientY - this.element.offsetTop}px`;

        };

        const onUp = () => {

            isResizing = false;

        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);

        this.cleanup = () => {

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        }
    }

}
