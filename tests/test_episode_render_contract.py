from __future__ import annotations

import json
import subprocess
import textwrap
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = ROOT / "web"


def run_node(module_code: str) -> dict:
    result = subprocess.run(
        [
            "node",
            "-e",
            module_code,
        ],
        cwd=WEB_DIR,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise AssertionError(
            f"node command failed\nstdout:\n{result.stdout}\nstderr:\n{result.stderr}"
        )

    stdout = result.stdout.strip()
    if not stdout:
        raise AssertionError("node command produced no stdout")
    return json.loads(stdout)


class EpisodeRenderContractTests(unittest.TestCase):
    def test_extract_storage_date_from_episode_json_path_uses_folder_date(self) -> None:
        payload = run_node(
            textwrap.dedent(
                """
                const fs = require('fs');
                const path = require('path');
                const vm = require('vm');
                const ts = require('typescript');
                const filename = path.resolve('src/lib/youtube-render.ts');
                const source = fs.readFileSync(filename, 'utf8');
                const transpiled = ts.transpileModule(source, {
                  compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2020,
                  },
                  fileName: filename,
                }).outputText;
                const sandbox = { module: { exports: {} }, require, console, process };
                sandbox.exports = sandbox.module.exports;
                vm.runInNewContext(transpiled, sandbox, { filename });
                const { extractStorageDateFromEpisodeJsonPath } = sandbox.module.exports;
                process.stdout.write(JSON.stringify({
                  value: extractStorageDateFromEpisodeJsonPath('/tmp/repo/podcast/20260312/ko/script.json')
                }));
                """
            )
        )
        self.assertEqual(payload["value"], "20260312")

    def test_build_render_motion_style_interpolates_opacity_and_y(self) -> None:
        payload = run_node(
            textwrap.dedent(
                """
                const fs = require('fs');
                const path = require('path');
                const vm = require('vm');
                const ts = require('typescript');
                const filename = path.resolve('src/lib/youtube-render.ts');
                const source = fs.readFileSync(filename, 'utf8');
                const transpiled = ts.transpileModule(source, {
                  compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2020,
                  },
                  fileName: filename,
                }).outputText;
                const sandbox = { module: { exports: {} }, require, console, process };
                sandbox.exports = sandbox.module.exports;
                vm.runInNewContext(transpiled, sandbox, { filename });
                const { buildRenderMotionStyle } = sandbox.module.exports;

                const before = buildRenderMotionStyle({
                  elapsedSec: 0.0,
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.1, duration: 0.2 },
                });
                const after = buildRenderMotionStyle({
                  elapsedSec: 0.5,
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.1, duration: 0.2 },
                });

                process.stdout.write(JSON.stringify({ before, after }));
                """
            )
        )
        self.assertEqual(payload["before"]["opacity"], 0)
        self.assertIn("translateY(12px)", payload["before"]["transform"])
        self.assertEqual(payload["after"]["opacity"], 1)
        self.assertIn("translateY(0px)", payload["after"]["transform"])

    def test_normalize_market_chart_symbol_matches_prefetch_aliases(self) -> None:
        payload = run_node(
            textwrap.dedent(
                """
                const fs = require('fs');
                const path = require('path');
                const vm = require('vm');
                const ts = require('typescript');
                const filename = path.resolve('src/lib/market-chart.ts');
                const source = fs.readFileSync(filename, 'utf8');
                const transpiled = ts.transpileModule(source, {
                  compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2020,
                  },
                  fileName: filename,
                }).outputText;
                const sandbox = { module: { exports: {} }, require, console, process };
                sandbox.exports = sandbox.module.exports;
                vm.runInNewContext(transpiled, sandbox, { filename });
                const { normalizeMarketChartSymbol } = sandbox.module.exports;
                process.stdout.write(JSON.stringify({
                  spx: normalizeMarketChartSymbol('^GSPC'),
                  ixic: normalizeMarketChartSymbol('^IXIC'),
                  tnx: normalizeMarketChartSymbol('^TNX'),
                }));
                """
            )
        )
        self.assertEqual(payload["spx"], "SP:SPX")
        self.assertEqual(payload["ixic"], "NASDAQ:IXIC")
        self.assertEqual(payload["tnx"], "TVC:US10Y")


if __name__ == "__main__":
    unittest.main()
