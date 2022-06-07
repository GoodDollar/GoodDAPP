/**
 * Copies the text to the clipboard. Must be called from within an event handler such as click.
 * @param textToCopy  The text to copy to the clipboard.
 * @returns  A promise that resolves when the text has been copied.
 */

export default function copyToClipboard(textToCopy: string): Promise<void> {
    // navigator clipboard api needs a secure context (https or localhost)
    if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard api method'
        return navigator.clipboard.writeText(textToCopy);
    } else {
        // text area method
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        // make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        return new Promise((res, rej) => {
            // here the magic happens
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
        });
    }
}