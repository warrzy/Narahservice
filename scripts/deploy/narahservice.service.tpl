[Unit]
Description=NARAH SERVICE Next.js (isolated)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=narah
Group=narah
WorkingDirectory=/var/www/narahservice/app
EnvironmentFile=/var/www/narahservice/shared/.env
ExecStart=/usr/bin/npm run start -- -H 127.0.0.1 -p __APP_PORT__
Restart=on-failure
RestartSec=5
TimeoutStartSec=60
StandardOutput=journal
StandardError=journal
SyslogIdentifier=narahservice
# Isolation légère
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=/var/www/narahservice

[Install]
WantedBy=multi-user.target
