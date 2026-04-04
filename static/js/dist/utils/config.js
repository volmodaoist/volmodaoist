export async function loadConfig(configPath) {
    try {
        const response = await fetch(configPath);
        const text = await response.text();
        return jsyaml.load(text) || {};
    }
    catch (error) {
        console.error("Error loading config:", error);
        return {};
    }
}
