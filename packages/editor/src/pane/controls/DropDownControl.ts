import { IBinding } from "../../Interfaces";
import { Control } from "./Control";

// Custom dropdown (what Tweakpane actually does)
// Instead of <select>, you build:
// Structure:
// <div class="dropdown">
//   <div class="dropdown-value">Red</div>
//   <div class="dropdown-menu">
//     <div class="dropdown-item">Red</div>
//     <div class="dropdown-item">Green</div>
//     <div class="dropdown-item">Blue</div>
//   </div>
// </div>
// 🎨 Then you get FULL control:
// .dropdown {
//   position: relative;
//   width: 100%;
//   font-size: 12px;
// }

// .dropdown-value {
//   padding: 2px 6px;
//   background: var(--panel-2);
//   border: 1px solid var(--border);
//   border-radius: 2px;
//   cursor: pointer;
// }

// .dropdown-menu {
//   position: absolute;
//   top: 100%;
//   left: 0;
//   right: 0;

//   background: var(--panel-2);
//   border: 1px solid var(--border);
//   border-radius: 2px;

//   margin-top: 2px;
//   overflow: hidden;
// }

// .dropdown-item {
//   padding: 4px 6px;
//   cursor: pointer;
// }

// .dropdown-item:hover {
//   background: var(--accent);
//   color: white;
// }

// Recommendation for YOUR system
// Given your:
// Control<T> abstraction
// Inspector system
// engine-like architecture
// You should NOT rely on native select long-term.
// Instead:
// Build custom dropdown controls as first-class primitives.
// Because then you get:
// hover state control
// animation system
// keyboard navigation
// theme consistency
// future extensibility (searchable dropdowns, enums, etc.)

export class DropDownControl<T> extends Control<T> {

    private select: HTMLSelectElement;

    constructor(binding: IBinding<T>, options: T[]) {

        super(binding);

        const select = document.createElement('select');
        select.classList.add('select');

        options.forEach((opt) => {

            const option = document.createElement('option');
            option.value = String(opt);
            option.textContent = String(opt);
            select.appendChild(option);

        });

        select.addEventListener('change', () => {

            this.setValue(select.value as unknown as T);

        });

        this.select = select;

        this.element.appendChild(this.select);
    }

    protected updateView(value: T): void {

        this.select.value = String(value);

    }
}