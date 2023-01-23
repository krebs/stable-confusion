{ lib, python3Packages }:
with python3Packages;
buildPythonApplication {
  pname = "mediengewitter";
  version = "1.0";

  propagatedBuildInputs = [ websockets requests ];

  src = ./.;
}