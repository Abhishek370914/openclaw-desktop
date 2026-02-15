/**
 * Onboarding Service - Handles OpenClaw installation and setup
 */

export async function checkOpenClawInstalled() {
    try {
        const response = await fetch('http://127.0.0.1:8000/check-openclaw');
        const data = await response.json();
        return data.installed || false;
    } catch (error) {
        console.error('Error checking OpenClaw:', error);
        return false;
    }
}

export async function installOpenClaw() {
    try {
        const response = await fetch('http://127.0.0.1:8000/install-openclaw', {
            method: 'POST'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error installing OpenClaw:', error);
        return { success: false, error: error.message };
    }
}

export async function checkDependencies() {
    try {
        const response = await fetch('http://127.0.0.1:8000/check-dependencies');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking dependencies:', error);
        return { success: false, error: error.message };
    }
}

export async function setupOpenClaw(config) {
    try {
        const response = await fetch('http://127.0.0.1:8000/setup-openclaw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error setting up OpenClaw:', error);
        return { success: false, error: error.message };
    }
}