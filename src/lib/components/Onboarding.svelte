<script lang="ts">
  import { appState } from '../stores.svelte';

  function toggleConnection(source: string) {
    if (appState.connectedSources.has(source)) {
      appState.connectedSources.delete(source);
    } else {
      appState.connectedSources.add(source);
    }
  }
</script>

<section class="panel" id="onboarding">
  <div class="panel-head">
    <h2>Connect Sources</h2>
    <p>Choose the platforms you want to pull from.</p>
  </div>
  <div class="source-grid">
    <button 
      class="source-card" 
      class:connected={appState.connectedSources.has('youtube')}
      onclick={() => toggleConnection('youtube')}
    >
      <div class="source-icon">▶</div>
      <div class="source-meta">
        <div class="source-name">YouTube</div>
        <div class="source-desc">Video + community posts</div>
      </div>
      <div class="source-action">
        {appState.connectedSources.has('youtube') ? 'Connected' : 'Connect'}
      </div>
    </button>
    <button 
      class="source-card" 
      class:connected={appState.connectedSources.has('reddit')}
      onclick={() => toggleConnection('reddit')}
    >
      <div class="source-icon">r/</div>
      <div class="source-meta">
        <div class="source-name">Reddit</div>
        <div class="source-desc">Text, links, discourse</div>
      </div>
      <div class="source-action">
        {appState.connectedSources.has('reddit') ? 'Connected' : 'Connect'}
      </div>
    </button>
  </div>
</section>

<style>
  .panel {
    background: rgba(13, 34, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(6px);
    overflow: hidden;
  }

  .panel-head h2 {
    margin: 0 0 6px;
    font-size: 20px;
  }

  .panel-head p {
    margin: 0 0 16px;
    color: var(--ink-soft);
    font-size: 14px;
  }

  .source-grid {
    display: grid;
    gap: 12px;
  }

  .source-card {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: var(--card);
    border-radius: var(--radius-md);
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s ease, border 0.2s ease, background 0.2s ease;
  }

  .source-card.connected {
    border-color: rgba(69, 242, 193, 0.8);
    background: rgba(69, 242, 193, 0.1);
  }

  .source-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .source-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    display: grid;
    place-items: center;
    font-weight: 700;
  }

  .source-meta {
    flex: 1;
    min-width: 0;
  }

  .source-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .source-desc {
    font-size: 12px;
    color: var(--ink-soft);
    overflow-wrap: anywhere;
  }

  .source-action {
    white-space: nowrap;
  }

  .source-action {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--accent);
  }

  @media (min-width: 720px) {
    .source-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
