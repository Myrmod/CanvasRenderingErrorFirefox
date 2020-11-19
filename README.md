# CanvasRenderingErrorFirefox

This repository is for showing an existing [bug(?)](https://bugzilla.mozilla.org/show_bug.cgi?id=1673635) in firefox. Just clone it and open the index.html file in your firefox browser where you will see the missing 2nd thumbnail in the canvas.

## Workaround
in index.js:47 you see a timeout which helps prevent this error.
