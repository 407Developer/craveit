<section class="panel profile">
  <div class="avatar">K</div>
  <h2>Kelvin</h2>
  <p>Profile shortcuts and account-level settings can live here.</p>
</section>

<style>
  .panel {
    background: rgba(13, 34, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(6px);
  }

  .profile {
    display: grid;
    justify-items: center;
    gap: 10px;
    text-align: center;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    background: linear-gradient(135deg, #45f2c1, #ffb038);
    color: #10231d;
    font-weight: 700;
    font-size: 26px;
    display: grid;
    place-items: center;
  }

  h2 {
    margin: 0;
  }

  p {
    margin: 0;
    color: var(--ink-soft);
  }
</style>
