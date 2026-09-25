#!/usr/bin/env bash
# Set up the hourly UF Scheduler scrape on the Pi (run there, as the normal user).
#
#   curl -fsSL https://raw.githubusercontent.com/JacobKulberg/jacobkulberg.com/main/.github/uf-scheduler/pi/install.sh | bash
#
# Afterwards: add ~/.ssh/uf_scheduler_deploy.pub to the repo as a deploy key
# with write access, and save a one.uf.edu Cookie header to
# ~/.config/uf-scheduler/cookie (chmod 600).
set -euo pipefail

key=~/.ssh/uf_scheduler_deploy
if [[ ! -f $key ]]; then
  mkdir -p ~/.ssh && chmod 700 ~/.ssh
  ssh-keygen -q -t ed25519 -N "" -C "uf-scheduler@$(hostname)" -f "$key"
  echo "New deploy key (add it to the repo with write access):"
  cat "$key.pub"
fi

mkdir -p ~/.config/uf-scheduler ~/.config/systemd/user
chmod 700 ~/.config/uf-scheduler

# The first run clones the repo; after that run.py keeps it up to date
# (core.sshCommand makes every later fetch in the clone use the deploy key)
if [[ ! -d ~/uf-scheduler/site/.git ]]; then
  ssh_cmd="ssh -i $key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
  GIT_SSH_COMMAND="$ssh_cmd" git clone -q --depth 1 --filter=blob:none --sparse \
    -c core.sshCommand="$ssh_cmd" \
    git@github.com:JacobKulberg/jacobkulberg.com.git ~/uf-scheduler/site
  git -C ~/uf-scheduler/site sparse-checkout set .github/uf-scheduler
fi

# Symlinks, so unit changes arrive with the repo
for unit in uf-scheduler-scrape.service uf-scheduler-scrape.timer; do
  ln -sf ~/uf-scheduler/site/.github/uf-scheduler/pi/$unit ~/.config/systemd/user/$unit
done

# User services keep running while logged out
loginctl enable-linger "$USER"
systemctl --user daemon-reload
systemctl --user enable --now uf-scheduler-scrape.timer
systemctl --user list-timers uf-scheduler-scrape.timer --no-pager
