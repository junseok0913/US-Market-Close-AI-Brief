# shorts-pexels-demo

Independent demo pipeline for building a shorts MP4 from:
- existing shorts script/audio artifacts
- free Pexels image search results
- Gemini Flash-based scene query + image relevance ranking

## Required env

- `PEXELS_API_KEY`
- `GEMINI_API_KEY` (if using LLM query/ranking)

## Run

```bash
./shorts-pexels-demo/run_shorts_pexels_demo.sh 20260304 --lang ko --overwrite
```

If you want deterministic fallback without LLM calls:

```bash
./shorts-pexels-demo/run_shorts_pexels_demo.sh 20260304 --lang ko --overwrite --no-llm --no-llm-ranker
```

## Outputs

- `podcast/{date}/{lang}/shorts-pexels-demo/scenes.json`
- `podcast/{date}/{lang}/shorts-pexels-demo/slides.render.json`
- `podcast/{date}/{lang}/shorts-pexels-demo/image_manifest.json`
- `podcast/{date}/{lang}/shorts-pexels-demo/images/*.jpg`
- `podcast/{date}/{lang}/shorts-pexels-demo/youtube/{date}_{lang}_shorts_pexels_demo.mp4`
ㄱ