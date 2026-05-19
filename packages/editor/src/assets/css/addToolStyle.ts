
const textContent = `
.add-tool {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width : 300px;
    background: #1e1e1e;
    border-radius: 8px;
    padding: 10px;
    z-index: 200;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.add-tool input {
    width: 100%;
    margin-bottom: 4px;
}

.add-tool .menu-row {
    padding: 6px;
    cursor: pointer;
    color: white;
    transition: background-color 0.15s ease;
}

.add-tool .menu-row:hover {
    background-color: rgba(255,255,255,0.1);
}
`;

export default textContent;

export const addToolClass = 'add-tool';
