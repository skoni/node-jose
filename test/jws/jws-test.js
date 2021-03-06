/*!
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
"use strict";

var cloneDeep = require("lodash.clonedeep");
var forEach = require("lodash.foreach");
var chai = require("chai");

var JWS = require("../../lib/jws");

var JWK = require("../../lib/jwk");

var assert = chai.assert;

var fixtures = {
  "4_1.rsa_v15_signature": cloneDeep(require("jose-cookbook/jws/4_1.rsa_v15_signature.json")),
  "4_2.rsa-pss_signature": cloneDeep(require("jose-cookbook/jws/4_2.rsa-pss_signature.json")),
  "4_3.ecdsa_signature": cloneDeep(require("jose-cookbook/jws/4_3.ecdsa_signature.json")),
  "4_4.hmac-sha2_integrity_protection": cloneDeep(require("jose-cookbook/jws/4_4.hmac-sha2_integrity_protection.json"))
};

describe("jws", function() {
  forEach(fixtures, function(fixture) {
    var input = fixture.input;
    var output = fixture.output;

    // TODO figure out how to generate description from fixture values
    describe(fixture.title, function() {
      before(function keyToJWK() {
        // coerse the key object ot a JWK object
        return JWK.asKey(input.key)
          .then(function(key) {
            input.key = key;
            assert(JWK.isKey(input.key));
          });
      });

      // signing
      if (fixture.reproducible) {
        it("signs to a compact JWS", function() {
          var options = {
            compact: true,
            protect: "*"
          };

          var signer = JWS.createSign(options, input.key);
          return signer.final(input.payload, "utf8").
            then(function(result) {
              assert.deepEqual(result, output.compact);
            });
        });
        it("signs to a general JSON JWS", function() {
          var options = {
            compact: false,
            protect: "*"
          };

          var signer = JWS.createSign(options, input.key);
          return signer.final(input.payload, "utf8").
            then(function(result) {
              assert.deepEqual(result, output.json);
            });
        });
        it("signs to a flattened JSON JWS", function() {
          var options = {
            format: "flattened",
            protect: "*"
          };

          var signer = JWS.createSign(options, input.key);
          return signer.final(input.payload, "utf8").
            then(function(result) {
              assert.deepEqual(result, output.json_flat);
            });
        });
      }

      // verifying
      it("verifies from a compact JWS", function() {
        var verifier = JWS.createVerify(input.key);
        return verifier.verify(output.compact).
          then(function(result) {
            // result.payload is a buffer, assert.equal will invoke its
            // toString() method implicitly
            assert.equal(result.payload, input.payload);

            // But let's make it clear that result.payload needs to be
            // converted before actually being a string.
            var payload = result.payload.toString();
            assert.deepEqual(result.key, input.key);
            assert.deepEqual(payload, input.payload);
          });
      });
      it("verifies from a general JSON JWS", function() {
        var verifier = JWS.createVerify(input.key);
        return verifier.verify(output.json).
          then(function(result) {
            // result.payload is a buffer, assert.equal will invoke its
            // toString() method implicitly
            assert.equal(result.payload, input.payload);

            // But let's make it clear that result.payload needs to be
            // converted before actually being a string.
            var payload = result.payload.toString();
            assert.deepEqual(result.key, input.key);
            assert.deepEqual(payload, input.payload);
          });
      });
      it("verifies from a flattened JSON JWS", function() {
        var verifier = JWS.createVerify(input.key);
        return verifier.verify(output.json_flat).
          then(function(result) {
            // result.payload is a buffer, assert.equal will invoke its
            // toString() method implicitly
            assert.equal(result.payload, input.payload);

            // But let's make it clear that result.payload needs to be
            // converted before actually being a string.
            var payload = result.payload.toString();
            assert.deepEqual(result.key, input.key);
            assert.deepEqual(payload, input.payload);
          });
      });
    });
  });
});
