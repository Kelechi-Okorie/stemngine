

export abstract class Node {

    public element: HTMLElement;

    constructor(tag = 'div') {

        this.element = document.createElement(tag);

    }

}
