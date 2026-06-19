import Card from '../ui/Card';
import Button from '../ui/Button';
import { useInstallPwa } from '../../hooks/useInstallPwa';

export default function InstallApp() {
  const { canInstall, isInstalled, install } = useInstallPwa();

  if (isInstalled) {
    return null;
  }

  return (
    <Card>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Install App
      </h2>
      <p className="mb-3 text-sm text-portfolio-gray">
        Add to your home screen for quick access and offline use.
      </p>

      {canInstall ? (
        <Button onClick={install} className="w-full">
          Install on this device
        </Button>
      ) : (
        <div className="space-y-2 text-sm text-portfolio-gray">
          <p>
            <strong className="text-white">iPhone:</strong> Safari → Share → Add to Home Screen
          </p>
          <p>
            <strong className="text-white">Android:</strong> Chrome menu → Install app / Add to Home screen
          </p>
        </div>
      )}
    </Card>
  );
}
