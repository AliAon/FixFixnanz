interface AuthTimeoutConfig {
  inactivityTimeout: number; // in milliseconds
  warningTimeout: number; // warning before logout
  checkInterval: number; // how often to check
}

class AuthTimeoutManager {
  private config: AuthTimeoutConfig;
  private lastActivity: number;
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private onLogout: () => void;
  private onWarning: () => void;

  constructor(
    config: Partial<AuthTimeoutConfig> = {},
    onLogout: () => void,
    onWarning: () => void = () => {}
  ) {
    this.config = {
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes default
      warningTimeout: 5 * 60 * 1000, // 5 minutes warning
      checkInterval: 60 * 1000, // check every minute
      ...config,
    };
    this.onLogout = onLogout;
    this.onWarning = onWarning;
    this.lastActivity = Date.now();
    this.initializeActivityTracking();
  }

  private initializeActivityTracking() {
    // Track user activities
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.resetTimeouts();
    };

    activities.forEach(activity => {
      document.addEventListener(activity, updateActivity, true);
    });

    // Start periodic checks
    this.startPeriodicCheck();
  }

  private startPeriodicCheck() {
    this.checkIntervalId = setInterval(() => {
      this.checkTimeout();
    }, this.config.checkInterval);
  }

  private checkTimeout() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    const timeUntilWarning = this.config.inactivityTimeout - this.config.warningTimeout;

    if (timeSinceLastActivity >= this.config.inactivityTimeout) {
      // Timeout reached - logout
      this.logout();
    } else if (timeSinceLastActivity >= timeUntilWarning) {
      // Show warning
      this.showWarning();
    }
  }

  private resetTimeouts() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }
  }

  private showWarning() {
    if (this.warningTimeoutId) return; // Warning already shown
    
    this.onWarning();
    this.warningTimeoutId = setTimeout(() => {
      this.logout();
    }, this.config.warningTimeout);
  }

  private logout() {
    this.cleanup();
    this.onLogout();
  }

  public cleanup() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    if (this.checkIntervalId) clearInterval(this.checkIntervalId);
  }

  public resetActivity() {
    this.lastActivity = Date.now();
    this.resetTimeouts();
  }

  public isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  public checkTokenExpiration(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    return this.isTokenExpired(token);
  }
}

export default AuthTimeoutManager; 