Tooltip

Usage: 
`
$("[data-tooltip]").tooltips({
	
	"descriptor": {
		// options
	}
});
`

Required markup: 

`
<element data-tooltip="true" data-tooltip-descriptor="descriptor"></element>
<sibling data-tooltip-target="true" data-tooltip-target-descriptor="descriptor"></sibling>
`

Options are:

`template` – you can pass any valid html as template. If you would like to pass parameters to template, that are generated in markup, you could specify `%param%` in template code and pass it with `data-tooltip-param` attribute. Parameter could be any valid html or text.
Default value: `<div class="g-tooltip">%contents%</div>`.

`showOn` – valid values are "hover", "click" and false.
Default value: `"hover"`.

`stickOn` – determines if tooltip should remain on screen after the event. Valid values are "hover", "click" and false.
Default value: `false`.

`hideOnOutsideClick` – determines if tooltip should hide when user clicks outside of it. Valid values: true and false.
Default value: `true`.
