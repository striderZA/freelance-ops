package screens

import (
	"testing"

	"github.com/santifer/freelance-ops/dashboard/internal/model"
	"github.com/santifer/freelance-ops/dashboard/internal/theme"
)

func TestSortCycleIncludesNewColumns(t *testing.T) {
	want := map[string]bool{sortPlatform: false, sortRate: false}
	for _, s := range sortCycle {
		if _, ok := want[s]; ok {
			want[s] = true
		}
	}
	for mode, found := range want {
		if !found {
			t.Errorf("sort cycle is missing %q", mode)
		}
	}
}

func TestSortByPlatformAndRate(t *testing.T) {
	apps := []model.CareerApplication{
		{Company: "A", Role: "Engineer", Platform: "Upwork", Rate: "$100/hr", Status: "proposed"},
		{Company: "B", Role: "Engineer", Platform: "Toptal", Rate: "$200/hr", Status: "qualified"},
		{Company: "C", Role: "Engineer", Platform: "Upwork", Rate: "$150/hr", Status: "new"},
	}

	pm := NewPipelineModel(theme.NewTheme("catppuccin-mocha"), apps, model.PipelineMetrics{Total: len(apps)}, "..", 120, 40)
	pm.viewMode = "flat"

	pm.sortMode = sortPlatform
	pm.applyFilterAndSort()
	if pm.filtered[0].Company != "A" || pm.filtered[len(pm.filtered)-1].Company != "B" {
		t.Fatalf("platform sort: expected Upwork first and Toptal last, got %s..%s",
			pm.filtered[0].Company, pm.filtered[len(pm.filtered)-1].Company)
	}

	pm.sortMode = sortRate
	pm.applyFilterAndSort()
	if pm.filtered[0].Company != "B" || pm.filtered[len(pm.filtered)-1].Company != "A" {
		t.Fatalf("rate sort: expected B ($200) first and A ($100) last, got %s..%s",
			pm.filtered[0].Company, pm.filtered[len(pm.filtered)-1].Company)
	}
}
