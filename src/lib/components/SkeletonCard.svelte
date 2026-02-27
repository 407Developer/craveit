<div class="skeleton-card">
  <div class="skeleton" style="height: 160px"></div>
  <div class="skeleton" style="width: 60%"></div>
  <div class="skeleton" style="width: 90%"></div>
  <div class="skeleton" style="width: 40%"></div>
</div>

<style>
  .skeleton-card {
    padding: 14px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
    display: grid;
    gap: 10px;
  }

  .skeleton {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
    border-radius: 12px;
    height: 14px;
  }

  @keyframes shimmer {
    0% { background-position: 0% 0; }
    100% { background-position: -200% 0; }
  }
</style>
