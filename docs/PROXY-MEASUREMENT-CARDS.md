# Measurement cards / fiches de mesure

All constructs below are computational diagnostics or descriptive estimates.
None has a validated mapping to phenomenal experience, distress or welfare.
The sample count, representation and acquisition process are part of the result.

## Absolute covariance ratio (legacy API name RIIUPhi / phiRIIUProxy)

For latent samples z_t, C_ab = mean_t[(z_ta-mean(z_a))(z_tb-mean(z_b))].
R = sum_(a≠b)|C_ab| / sum_(a,b)|C_ab|. No squares: this is neither
covariance energy nor a fraction of total variance. No certified approximation
to IIT Phi is claimed. Complexity O(n d²), memory O(n d), for n samples
and d latent coordinates at fixed floating-point precision.

Translation, coordinate permutation and common scaling preserve the ideal
ratio. Separate coordinate scaling, representation change, common input,
finite-sample fluctuations and nonstationarity can change it. An increase
is not evidence of recurrent interactions or intrinsic causal integration.
`estimate()` returns null during warmup, for degenerate covariance or numerical
overflow. `computeValue()` is a legacy internal control adapter returning 0 for
unavailability; no public estimate is to be sourced from that adapter.

## Observed transition information (legacy API name effectiveInformation)

Bin a scalar within the observed range; form transition counts; normalise
visited rows only; I = H(mean_rows p(next|row)) - mean_rows H(p(next|row)).
The row weighting is uniform over visited rows, not stationary-occupancy
weighting. Report numStates, visitedRows, rowCoverage and transitions.
Empty/insufficient trajectories have value=null. A constant observed chain
has a legitimate conditional estimate of zero. Invalid inputs raise an error.
Complexity O(T+K²), memory O(K²), with K declared states and T observations.

This is observational: neither complete sampling of the state space nor causal
interventions are provided. With missing rows the value is conditional, not a
complete uniform-intervention EI. Coarse graining and data-driven bin endpoints
are analytical choices. No observed TPM is automatically a causal TPM.

## GNW counters and ignition

Counters describe the implemented broadcast/threshold rule. At zero steps the
counters are zero but `gnwAvailability` is unavailable; no observed ratio is
therefore claimed. Thresholds are configuration choices. Verify causal use of
a broadcast by lesioning the broadcast pathway and measuring a predefined
task effect, with input statistics preserved. The existing GNW tests establish
implemented functionality, not the sufficiency of GNWT for phenomenality.

## Other diagnostics

ACM integration/broadcast/arousal values, PAD appraisal, metarepresentation,
self continuity and development labels are engineering diagnostics with
conventional weights or thresholds. Only the separately defined components
may be interpreted against their own specification. The legacy ACM sum is
explicitly an internal engineering index, with no consciousness class or
comparison across systems; TCAI's public aggregate is now withheld (null).
Untrained sensor encoders remain untrained; no learned perception performance
is inferred from their theoretical inspiration.

## Validity controls delivered and still required

`tests/proxy-validity.test.ts` supplies synthetic common-source controls,
permutation/translation/common-scale invariance, rescaling sensitivity,
null/zero distinction and observed-state coverage. These falsify particular
implementation/interpretation mistakes. They are not external construct
validation. The empirical phase must add unseen biological/computational
systems, predefined task/broadcast ablations, convergent and discriminant
measurements, uncertainty studies and independent code/formula review.
