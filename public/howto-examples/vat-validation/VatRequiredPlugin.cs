using System;
using Microsoft.Xrm.Sdk;

namespace Contoso.HowTo
{
    // Focused Create-only example, not the full demo's VAT format validator.
    public sealed class VatRequiredPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            if (context.MessageName != "Create" || !context.InputParameters.Contains("Target"))
                return;

            var target = context.InputParameters["Target"] as Entity;
            if (target == null || target.LogicalName != "account")
                return;

            var accountType = target.GetAttributeValue<OptionSetValue>("new_accounttype");
            if (accountType == null || accountType.Value != 505480000)
                return;

            var vatNumber = target.GetAttributeValue<string>("new_vatnumber");
            if (string.IsNullOrWhiteSpace(vatNumber))
            {
                tracing.Trace("Business account with no VAT number; blocking save.");
                throw new InvalidPluginExecutionException(
                    "VAT number is required and must be valid for business accounts.");
            }

            tracing.Trace("Business account with a VAT number; allowing save.");
        }
    }
}
