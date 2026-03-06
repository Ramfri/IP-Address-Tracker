document.addEventListener('DOMContentLoaded', async () => {
    const {Tracker} = await import('./tracker/tracker.js');
    const tracker = new Tracker();
    await tracker.start();
});