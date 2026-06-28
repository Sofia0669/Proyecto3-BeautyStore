using BeautyStore.Models;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using System.Globalization;
using System.Net.Http.Headers;

public class PayPalService
{
    private PayPalHttpClient client;

    public PayPalService()
    {
        var environment = new SandboxEnvironment(
            "AdcW48zVwlVE0qVIzm16fUtEM5ZzhEJGKXwzC3hsQKnmt9Flk0RoLTAo4PTgvoFC9vlDGq7altz4rqWz",
            "EH_V6j0iRhT3mWQ_CV5p8v-9IAn7cz4pU5mXLaDEdrF8rOdgFhv-QeJ8omMGlwIR2HM9CzwoI_zVbUbD"
        );

        client = new PayPalHttpClient(environment);
    }

    // 🟢 CREAR ORDEN
    public async Task<string> CreateOrder(decimal monto)
    {
        var request = new OrdersCreateRequest();
        request.Prefer("return=representation");

        request.RequestBody(new OrderRequest()
        {
            CheckoutPaymentIntent = "CAPTURE",
            PurchaseUnits = new List<PurchaseUnitRequest>
            {
                new PurchaseUnitRequest
                {
                    AmountWithBreakdown = new AmountWithBreakdown
                    {
                        CurrencyCode = "USD",
                        Value = monto.ToString("F2", CultureInfo.InvariantCulture)
    }
                }
            }
        });

        var response = await client.Execute(request);
        var result = response.Result<Order>();

        return result.Id;
    }

    // 🟢 CAPTURAR ORDEN
    public async Task<Order> CaptureOrder(string orderId)
    {
        var request = new OrdersCaptureRequest(orderId);
        request.RequestBody(new OrderActionRequest());

        var response = await client.Execute(request);
        return response.Result<Order>();
    }
}
