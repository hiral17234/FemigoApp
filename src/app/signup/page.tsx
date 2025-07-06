"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Globe, User } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  country: z.string({
    required_error: "Please select a country.",
  }),
})

export default function SignupPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "Account created!",
      description: "You have successfully created your account.",
    })
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f0f2ff] to-[#fff0f5] dark:from-gray-900 dark:to-black">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary md:left-8 md:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Create Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join Femigo and be part of our community.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6 text-left"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Your Name"
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Globe className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-72">
                          <SelectItem value="afghanistan">Afghanistan</SelectItem>
                          <SelectItem value="albania">Albania</SelectItem>
                          <SelectItem value="algeria">Algeria</SelectItem>
                          <SelectItem value="andorra">Andorra</SelectItem>
                          <SelectItem value="angola">Angola</SelectItem>
                          <SelectItem value="antigua-and-barbuda">Antigua and Barbuda</SelectItem>
                          <SelectItem value="argentina">Argentina</SelectItem>
                          <SelectItem value="armenia">Armenia</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                          <SelectItem value="austria">Austria</SelectItem>
                          <SelectItem value="azerbaijan">Azerbaijan</SelectItem>
                          <SelectItem value="bahamas">Bahamas</SelectItem>
                          <SelectItem value="bahrain">Bahrain</SelectItem>
                          <SelectItem value="bangladesh">Bangladesh</SelectItem>
                          <SelectItem value="barbados">Barbados</SelectItem>
                          <SelectItem value="belarus">Belarus</SelectItem>
                          <SelectItem value="belgium">Belgium</SelectItem>
                          <SelectItem value="belize">Belize</SelectItem>
                          <SelectItem value="benin">Benin</SelectItem>
                          <SelectItem value="bhutan">Bhutan</SelectItem>
                          <SelectItem value="bolivia">Bolivia</SelectItem>
                          <SelectItem value="bosnia-and-herzegovina">Bosnia and Herzegovina</SelectItem>
                          <SelectItem value="botswana">Botswana</SelectItem>
                          <SelectItem value="brazil">Brazil</SelectItem>
                          <SelectItem value="brunei">Brunei</SelectItem>
                          <SelectItem value="bulgaria">Bulgaria</SelectItem>
                          <SelectItem value="burkina-faso">Burkina Faso</SelectItem>
                          <SelectItem value="burundi">Burundi</SelectItem>
                          <SelectItem value="cabo-verde">Cabo Verde</SelectItem>
                          <SelectItem value="cambodia">Cambodia</SelectItem>
                          <SelectItem value="cameroon">Cameroon</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="central-african-republic">Central African Republic</SelectItem>
                          <SelectItem value="chad">Chad</SelectItem>
                          <SelectItem value="chile">Chile</SelectItem>
                          <SelectItem value="china">China</SelectItem>
                          <SelectItem value="colombia">Colombia</SelectItem>
                          <SelectItem value="comoros">Comoros</SelectItem>
                          <SelectItem value="congo-congo-brazzaville">Congo (Congo-Brazzaville)</SelectItem>
                          <SelectItem value="congo-democratic-republic">Congo (Democratic Republic)</SelectItem>
                          <SelectItem value="costa-rica">Costa Rica</SelectItem>
                          <SelectItem value="cote-d'ivoire">Cote d'Ivoire</SelectItem>
                          <SelectItem value="croatia">Croatia</SelectItem>
                          <SelectItem value="cuba">Cuba</SelectItem>
                          <SelectItem value="cyprus">Cyprus</SelectItem>
                          <SelectItem value="czechia">Czechia</SelectItem>
                          <SelectItem value="denmark">Denmark</SelectItem>
                          <SelectItem value="djibouti">Djibouti</SelectItem>
                          <SelectItem value="dominica">Dominica</SelectItem>
                          <SelectItem value="dominican-republic">Dominican Republic</SelectItem>
                          <SelectItem value="ecuador">Ecuador</SelectItem>
                          <SelectItem value="egypt">Egypt</SelectItem>
                          <SelectItem value="el-salvador">El Salvador</SelectItem>
                          <SelectItem value="equatorial-guinea">Equatorial Guinea</SelectItem>
                          <SelectItem value="eritrea">Eritrea</SelectItem>
                          <SelectItem value="estonia">Estonia</SelectItem>
                          <SelectItem value="eswatini">Eswatini</SelectItem>
                          <SelectItem value="ethiopia">Ethiopia</SelectItem>
                          <SelectItem value="fiji">Fiji</SelectItem>
                          <SelectItem value="finland">Finland</SelectItem>
                          <SelectItem value="france">France</SelectItem>
                          <SelectItem value="gabon">Gabon</SelectItem>
                          <SelectItem value="gambia">Gambia</SelectItem>
                          <SelectItem value="georgia">Georgia</SelectItem>
                          <SelectItem value="germany">Germany</SelectItem>
                          <SelectItem value="ghana">Ghana</SelectItem>
                          <SelectItem value="greece">Greece</SelectItem>
                          <SelectItem value="grenada">Grenada</SelectItem>
                          <SelectItem value="guatemala">Guatemala</SelectItem>
                          <SelectItem value="guinea">Guinea</SelectItem>
                          <SelectItem value="guinea-bissau">Guinea-Bissau</SelectItem>
                          <SelectItem value="guyana">Guyana</SelectItem>
                          <SelectItem value="haiti">Haiti</SelectItem>
                          <SelectItem value="honduras">Honduras</SelectItem>
                          <SelectItem value="hungary">Hungary</SelectItem>
                          <SelectItem value="iceland">Iceland</SelectItem>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="indonesia">Indonesia</SelectItem>
                          <SelectItem value="iran">Iran</SelectItem>
                          <SelectItem value="iraq">Iraq</SelectItem>
                          <SelectItem value="ireland">Ireland</SelectItem>
                          <SelectItem value="israel">Israel</SelectItem>
                          <SelectItem value="italy">Italy</SelectItem>
                          <SelectItem value="jamaica">Jamaica</SelectItem>
                          <SelectItem value="japan">Japan</SelectItem>
                          <SelectItem value="jordan">Jordan</SelectItem>
                          <SelectItem value="kazakhstan">Kazakhstan</SelectItem>
                          <SelectItem value="kenya">Kenya</SelectItem>
                          <SelectItem value="kiribati">Kiribati</SelectItem>
                          <SelectItem value="kosovo">Kosovo</SelectItem>
                          <SelectItem value="kuwait">Kuwait</SelectItem>
                          <SelectItem value="kyrgyzstan">Kyrgyzstan</SelectItem>
                          <SelectItem value="laos">Laos</SelectItem>
                          <SelectItem value="latvia">Latvia</SelectItem>
                          <SelectItem value="lebanon">Lebanon</SelectItem>
                          <SelectItem value="lesotho">Lesotho</SelectItem>
                          <SelectItem value="liberia">Liberia</SelectItem>
                          <SelectItem value="libya">Libya</SelectItem>
                          <SelectItem value="liechtenstein">Liechtenstein</SelectItem>
                          <SelectItem value="lithuania">Lithuania</SelectItem>
                          <SelectItem value="luxembourg">Luxembourg</SelectItem>
                          <SelectItem value="madagascar">Madagascar</SelectItem>
                          <SelectItem value="malawi">Malawi</SelectItem>
                          <SelectItem value="malaysia">Malaysia</SelectItem>
                          <SelectItem value="maldives">Maldives</SelectItem>
                          <SelectItem value="mali">Mali</SelectItem>
                          <SelectItem value="malta">Malta</SelectItem>
                          <SelectItem value="marshall-islands">Marshall Islands</SelectItem>
                          <SelectItem value="mauritania">Mauritania</SelectItem>
                          <SelectItem value="mauritius">Mauritius</SelectItem>
                          <SelectItem value="mexico">Mexico</SelectItem>
                          <SelectItem value="micronesia">Micronesia</SelectItem>
                          <SelectItem value="moldova">Moldova</SelectItem>
                          <SelectItem value="monaco">Monaco</SelectItem>
                          <SelectItem value="mongolia">Mongolia</SelectItem>
                          <SelectItem value="montenegro">Montenegro</SelectItem>
                          <SelectItem value="morocco">Morocco</SelectItem>
                          <SelectItem value="mozambique">Mozambique</SelectItem>
                          <SelectItem value="myanmar">Myanmar</SelectItem>
                          <SelectItem value="namibia">Namibia</SelectItem>
                          <SelectItem value="nauru">Nauru</SelectItem>
                          <SelectItem value="nepal">Nepal</SelectItem>
                          <SelectItem value="netherlands">Netherlands</SelectItem>
                          <SelectItem value="new-zealand">New Zealand</SelectItem>
                          <SelectItem value="nicaragua">Nicaragua</SelectItem>
                          <SelectItem value="niger">Niger</SelectItem>
                          <SelectItem value="nigeria">Nigeria</SelectItem>
                          <SelectItem value="north-korea">North Korea</SelectItem>
                          <SelectItem value="north-macedonia">North Macedonia</SelectItem>
                          <SelectItem value="norway">Norway</SelectItem>
                          <SelectItem value="oman">Oman</SelectItem>
                          <SelectItem value="pakistan">Pakistan</SelectItem>
                          <SelectItem value="palau">Palau</SelectItem>
                          <SelectItem value="palestine-state">Palestine State</SelectItem>
                          <SelectItem value="panama">Panama</SelectItem>
                          <SelectItem value="papua-new-guinea">Papua New Guinea</SelectItem>
                          <SelectItem value="paraguay">Paraguay</SelectItem>
                          <SelectItem value="peru">Peru</SelectItem>
                          <SelectItem value="philippines">Philippines</SelectItem>
                          <SelectItem value="poland">Poland</SelectItem>
                          <SelectItem value="portugal">Portugal</SelectItem>
                          <SelectItem value="qatar">Qatar</SelectItem>
                          <SelectItem value="romania">Romania</SelectItem>
                          <SelectItem value="russia">Russia</SelectItem>
                          <SelectItem value="rwanda">Rwanda</SelectItem>
                          <SelectItem value="saint-kitts-and-nevis">Saint Kitts and Nevis</SelectItem>
                          <SelectItem value="saint-lucia">Saint Lucia</SelectItem>
                          <SelectItem value="saint-vincent-and-the-grenadines">Saint Vincent and the Grenadines</SelectItem>
                          <SelectItem value="samoa">Samoa</SelectItem>
                          <SelectItem value="san-marino">San Marino</SelectItem>
                          <SelectItem value="sao-tome-and-principe">Sao Tome and Principe</SelectItem>
                          <SelectItem value="saudi-arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="senegal">Senegal</SelectItem>
                          <SelectItem value="serbia">Serbia</SelectItem>
                          <SelectItem value="seychelles">Seychelles</SelectItem>
                          <SelectItem value="sierra-leone">Sierra Leone</SelectItem>
                          <SelectItem value="singapore">Singapore</SelectItem>
                          <SelectItem value="slovakia">Slovakia</SelectItem>
                          <SelectItem value="slovenia">Slovenia</SelectItem>
                          <SelectItem value="solomon-islands">Solomon Islands</SelectItem>
                          <SelectItem value="somalia">Somalia</SelectItem>
                          <SelectItem value="south-africa">South Africa</SelectItem>
                          <SelectItem value="south-korea">South Korea</SelectItem>
                          <SelectItem value="south-sudan">South Sudan</SelectItem>
                          <SelectItem value="spain">Spain</SelectItem>
                          <SelectItem value="sri-lanka">Sri Lanka</SelectItem>
                          <SelectItem value="sudan">Sudan</SelectItem>
                          <SelectItem value="sweden">Sweden</SelectItem>
                          <SelectItem value="switzerland">Switzerland</SelectItem>
                          <SelectItem value="syria">Syria</SelectItem>
                          <SelectItem value="taiwan">Taiwan</SelectItem>
                          <SelectItem value="tajikistan">Tajikistan</SelectItem>
                          <SelectItem value="tanzania">Tanzania</SelectItem>
                          <SelectItem value="thailand">Thailand</SelectItem>
                          <SelectItem value="timor-leste">Timor-Leste</SelectItem>
                          <SelectItem value="togo">Togo</SelectItem>
                          <SelectItem value="tonga">Tonga</SelectItem>
                          <SelectItem value="trinidad-and-tobago">Trinidad and Tobago</SelectItem>
                          <SelectItem value="tunisia">Tunisia</SelectItem>
                          <SelectItem value="turkey">Turkey</SelectItem>
                          <SelectItem value="turkmenistan">Turkmenistan</SelectItem>
                          <SelectItem value="tuvalu">Tuvalu</SelectItem>
                          <SelectItem value="uganda">Uganda</SelectItem>
                          <SelectItem value="ukraine">Ukraine</SelectItem>
                          <SelectItem value="united-arab-emirates">United Arab Emirates</SelectItem>
                          <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                          <SelectItem value="united-states">United States</SelectItem>
                          <SelectItem value="uruguay">Uruguay</SelectItem>
                          <SelectItem value="uzbekistan">Uzbekistan</SelectItem>
                          <SelectItem value="vanuatu">Vanuatu</SelectItem>
                          <SelectItem value="vatican-city">Vatican City</SelectItem>
                          <SelectItem value="venezuela">Venezuela</SelectItem>
                          <SelectItem value="vietnam">Vietnam</SelectItem>
                          <SelectItem value="yemen">Yemen</SelectItem>
                          <SelectItem value="zambia">Zambia</SelectItem>
                          <SelectItem value="zimbabwe">Zimbabwe</SelectItem>
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full rounded-xl bg-[#EC008C] py-3 text-lg text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none"
                >
                  Create Account
                </Button>
              </form>
            </Form>

            <p className="pt-2 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#EC008C] hover:underline dark:text-pink-400"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
