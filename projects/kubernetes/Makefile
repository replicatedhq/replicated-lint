LINT ?= replicated-lint

deps:
	npm install -g replicated-lint

verify-rules:
	$(LINT) verify-rules --rules rules-no-latest.yaml

generate-docs:
	$(LINT) docs gen --excludeDefaults --extraRules rules-no-latest.yaml > ./docs-generated.md

validate-pod-good:
	$(LINT) validate --infile pod-good.yaml --excludeDefaults --threshold warn --extraRules rules-no-latest.yaml

validate-pod-bad:
	$(LINT) validate --infile pod-bad.yaml  --excludeDefaults --threshold warn --extraRules rules-no-latest.yaml

