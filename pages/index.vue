<template>
    <div class="flex min-h-[100dvh] flex-row items-start justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-2 flex-1 max-w-max">
        <div class="flex flex-col items-center justify-center gap-2 rounded-lg   p-6 md:p-8">
          <div class="flex w-full items-center justify-center gap-2 flex-col">
            <img src="@/assets/inventory-01.svg" class="h-32 w-32 text-primary" />
            <h2 class="text-2xl font-bold text-white">Inventory</h2>
          </div>
          
          <div class="text-4xl font-bold text-white">
            <span>0.5234</span>
            <span class="ml-1 text-2xl text-muted-foreground">BTC</span>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <div class="text-4xl font-bold text-white">
              <span>10.0000</span>
              <span class="ml-1 text-2xl text-muted-foreground">HI</span>
              <div class="mt-2 text-sm font-medium text-muted-foreground text-center">$100.00 USD</div>
            </div>
            <div class="flex gap-2">
              <Button>Send</Button>
              <Button variant="outline" class=" text-primary-foreground">
                Explore
              </Button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <IconsBitcoin class="h-6 w-6 text-primary" />
            <div>
              <div class="font-medium text-white">Address 1</div>
              <div class="text-sm text-muted-foreground pr-2">bc1q3r4j2q4j2q4j2q4j2q4j2q4j2q4j2q4j2q4</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" class="text-foreground">
              <IconsCopy class="h-4 w-4" />
            </Button>
            <Button variant="destructive">
              <IconsTrash class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <IconsBitcoin class="h-6 w-6 text-primary" />
            <div>
              <div class="font-medium text-white">Address 2</div>
              <div class="text-sm text-muted-foreground">bc1q3r4j2q4j2q4j2q4j2q4j2q4j2q4j2q4j2q4</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" class="text-foreground">
              <IconsCopy class="h-4 w-4" />
            </Button>
            <Button variant="destructive">
              <IconsTrash class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <Button>Add Address</Button>
        </div>
      </div>
      <div class="flex flex-col gap-4 border-l p-6 md:p-8 flex-1 h-full max-h-[90%]">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">Transactions</h2>
        </div>
        <div class="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="text-white">Date</TableHead>
                <TableHead class="text-white">Type</TableHead>
                <TableHead class="text-white">Amount</TableHead>
                <TableHead class="text-white">Confirmations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="text-white">2023-04-15 10:30 AM</TableCell>
                <TableCell>
                  <Badge variant="outline"   class="border-red-600 text-red-500">
                    Sent BTC
                  </Badge>
                </TableCell>
                <TableCell class="text-red-500">-0.1234 BTC</TableCell>
                <TableCell>
                  <Badge variant="secondary">Confirmed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="text-white">2023-04-10 3:45 PM</TableCell>
                <TableCell>
                  <Badge variant="outline" class="border-green-600 text-green-500">
                    Received BTC
                  </Badge>
                </TableCell>
                <TableCell class="text-green-500">+0.5678 BTC</TableCell>
                <TableCell>
                  <Badge variant="secondary">Confirmed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="text-white">2023-04-05 9:00 AM</TableCell>
                <TableCell>
                  <Badge variant="outline" class="text-red-500">
                    Sent
                  </Badge>
                </TableCell>
                <TableCell class="text-red-500">-0.0987 BTC</TableCell>
                <TableCell>
                  <Badge variant="secondary">Confirmed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="text-white">2023-03-30 2:15 PM</TableCell>
                <TableCell>
                  <Badge variant="outline" class="text-green-500">
                    Received
                  </Badge>
                </TableCell>
                <TableCell class="text-green-500">+0.3456 BTC</TableCell>
                <TableCell>
                  <Badge variant="secondary">Confirmed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="text-white">2023-03-25 11:20 AM</TableCell>
                <TableCell>
                  <Badge variant="outline" class="text-red-500">
                    Sent
                  </Badge>
                </TableCell>
                <TableCell class="text-red-500">-0.2109 BTC</TableCell>
                <TableCell>
                  <Badge variant="secondary">Confirmed</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </template>

<script setup>
</script>
