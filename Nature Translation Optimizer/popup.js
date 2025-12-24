document.addEventListener('DOMContentLoaded', () => {
    const master = document.getElementById('masterSwitch');
    const radios = document.querySelectorAll('input[name="mode"]');

    // 初始加载配置
    chrome.storage.sync.get(['enabled', 'mode'], (res) => {
        if (chrome.runtime.lastError) return;
        master.checked = res.enabled || false;
        const mode = res.mode || 'clean';
        const targetRadio = document.querySelector(`input[value="${mode}"]`);
        if (targetRadio) targetRadio.checked = true;
    });

    function update() {
        const isEnabled = master.checked;
        const currentMode = document.querySelector('input[name="mode"]:checked').value;
        
        chrome.storage.sync.set({ enabled: isEnabled, mode: currentMode });

        // 向当前页面发送更新指令
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "UPDATE", enabled: isEnabled, mode: currentMode }, () => {
                    if (chrome.runtime.lastError) {
                        // 忽略 context invalidated 报错，这是预料之中的
                    }
                });
            }
        });
    }

    master.addEventListener('change', update);
    radios.forEach(r => r.addEventListener('change', update));
});