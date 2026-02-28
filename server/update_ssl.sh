sudo cat /etc/letsencrypt/live/tekbreak.com/privkey.pem > /home/tekbreak/ssl/home-dashboard/server.key
sudo cat /etc/letsencrypt/live/tekbreak.com/fullchain.pem > /home/tekbreak/ssl/home-dashboard/server.pem
sudo chown -R tekbreak:tekbreak /home/tekbreak/ssl/*
