LINT = replicated-lint

deps:
	npm install -g replicated-lint

verify-rules:
	$(LINT) verify-rules --rules rules.yaml

generate-docs:
	$(LINT) docs gen --excludeDefaults --extraRules rules.yaml > ./docs-generated.md

validate-spec-good:
	$(LINT) validate --infile spec-good.yaml --excludeDefaults --threshold warn --schema ./schema.json --extraRules rules.yaml

validate-spec-bad:
	$(LINT) validate --infile spec-bad.yaml  --excludeDefaults --threshold warn --schema ./schema.json --extraRules rules.yaml

all: verify-rules validate-spec-good validate-spec-bad
