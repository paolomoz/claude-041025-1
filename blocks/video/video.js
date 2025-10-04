/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

function embedYoutube(url, autoplay) {
  const usp = new URLSearchParams(url.search);
  let vid = encodeURIComponent(usp.get('v'));
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
}

function embedVimeo(url, autoplay) {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
}

function getVideoElement(source, autoplay) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  video.dataset.loading = 'true';
  video.addEventListener('loadedmetadata', () => delete video.dataset.loading);
  if (autoplay) video.setAttribute('autoplay', '');

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.innerHTML = '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      block.innerHTML = '';
      const url = new URL(link);
      const isYoutube = link.includes('youtube') || link.includes('youtu.be');
      const isVimeo = link.includes('vimeo');
      if (isYoutube) {
        block.innerHTML = embedYoutube(url, true);
      } else if (isVimeo) {
        block.innerHTML = embedVimeo(url, true);
      } else {
        block.append(getVideoElement(link, true));
      }
    });
    block.append(wrapper);
  } else {
    const url = new URL(link);
    const isYoutube = link.includes('youtube') || link.includes('youtu.be');
    const isVimeo = link.includes('vimeo');
    if (isYoutube) {
      block.innerHTML = embedYoutube(url, false);
    } else if (isVimeo) {
      block.innerHTML = embedVimeo(url, false);
    } else {
      block.append(getVideoElement(link, false));
    }
  }
}
