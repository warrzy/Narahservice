# Bootstrap HTTP uniquement (avant certificat Let's Encrypt)
upstream narahservice_next {
    server 127.0.0.1:__APP_PORT__;
    keepalive 8;
}

server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN__ __WWW_DOMAIN__;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://narahservice_next;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
