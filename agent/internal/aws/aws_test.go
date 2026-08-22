package aws

import "testing"

func TestNew(t *testing.T) {
	tests := []struct {
		name      string
		accountID string
		region    string
		wantErr   bool
		wantReg   string
	}{
		{name: "valid", accountID: "482910475620", region: "eu-west-1", wantReg: "eu-west-1"},
		{name: "empty region falls back", accountID: "482910475620", wantReg: "us-east-1"},
		{name: "short account id rejected", accountID: "1234", wantErr: true},
		{name: "non-numeric rejected", accountID: "abcdefghijkl", wantErr: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, err := New(tt.accountID, tt.region)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("New(%q) expected error, got none", tt.accountID)
				}
				return
			}
			if err != nil {
				t.Fatalf("New(%q) unexpected error: %v", tt.accountID, err)
			}
			if c.Region != tt.wantReg {
				t.Errorf("Region = %q, want %q", c.Region, tt.wantReg)
			}
		})
	}
}
