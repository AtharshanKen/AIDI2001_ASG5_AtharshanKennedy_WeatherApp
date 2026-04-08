import argparse
import sys
from pathlib import Path

from weather_etl.pipeline import create_runner
from weather_etl.storage import create_storage_from_environment


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="weather_etl")
    subparsers = parser.add_subparsers(dest="command", required=True)

    run_parser = subparsers.add_parser("run")
    city_selection = run_parser.add_mutually_exclusive_group(required=True)
    city_selection.add_argument("--city")
    city_selection.add_argument("--all", action="store_true")
    run_parser.add_argument("--output-root", required=True)
    run_parser.add_argument("--run-date", required=True)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    try:
        args = parser.parse_args(argv)
    except SystemExit as error:
        return int(error.code)

    if args.command == "run":
        try:
            storage = create_storage_from_environment(output_root=Path(args.output_root))
            runner = create_runner(storage=storage)
            if args.all:
                runner.run_all(run_date=args.run_date)
            else:
                runner.run_city(city_key=args.city, run_date=args.run_date)
        except Exception as error:
            print(error, file=sys.stderr)
            return 1
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
